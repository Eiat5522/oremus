import {
  ConfigPlugin,
  withAndroidManifest,
  withDangerousMod,
  withMainApplication,
  withStringsXml,
} from 'expo/config-plugins';
import fs from 'fs/promises';
import path from 'path';

const FOCUS_PACKAGE = 'focus';
const FOCUS_GATE_SERVICE_DESCRIPTION_KEY = 'focus_gate_service_description';
const FOCUS_GATE_SERVICE_DESCRIPTION =
  'Focus Gate monitors when selected apps are opened so it can block distractions until you complete a prayer session.';

const focusFiles: Record<string, string> = {
  'FocusGatePrefs.kt': `package __PACKAGE__.focus

import android.content.Context
import org.json.JSONObject

object FocusGatePrefs {
  private const val PREFS_NAME = "focus_gate_prefs"
  private const val KEY_ENABLED = "enabled"
  private const val KEY_UNLOCK_WINDOW_MINUTES = "unlockWindowMinutes"
  private const val KEY_UNLOCK_UNTIL_MS = "unlockUntilMs"
  private const val KEY_BLOCKED_PACKAGES = "blockedPackages"

  private fun prefs(context: Context) =
    context.applicationContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

  fun applySettingsJson(context: Context, settingsJson: String): Boolean {
    val data = JSONObject(settingsJson)
    val editor = prefs(context).edit()
    editor.putBoolean(KEY_ENABLED, data.optBoolean(KEY_ENABLED, false))
    editor.putInt(KEY_UNLOCK_WINDOW_MINUTES, data.optInt(KEY_UNLOCK_WINDOW_MINUTES, 30))
    if (data.has(KEY_UNLOCK_UNTIL_MS) && !data.isNull(KEY_UNLOCK_UNTIL_MS)) {
      editor.putLong(KEY_UNLOCK_UNTIL_MS, data.optLong(KEY_UNLOCK_UNTIL_MS, 0L))
    } else {
      editor.putLong(KEY_UNLOCK_UNTIL_MS, 0L)
    }

    val blocked = data.optJSONArray(KEY_BLOCKED_PACKAGES)
    val packages = mutableSetOf<String>()
    if (blocked != null) {
      for (i in 0 until blocked.length()) {
        val item = blocked.optString(i, "")
        if (item.isNotBlank()) {
          packages.add(item)
        }
      }
    }
    editor.putStringSet(KEY_BLOCKED_PACKAGES, packages)
    return editor.commit()
  }

  fun getUnlockWindowMinutes(context: Context): Int =
    prefs(context).getInt(KEY_UNLOCK_WINDOW_MINUTES, 30)

  fun isEnabled(context: Context): Boolean =
    prefs(context).getBoolean(KEY_ENABLED, false)

  fun getUnlockUntilMs(context: Context): Long =
    prefs(context).getLong(KEY_UNLOCK_UNTIL_MS, 0L)

  fun getBlockedPackages(context: Context): Set<String> =
    prefs(context).getStringSet(KEY_BLOCKED_PACKAGES, emptySet()) ?: emptySet()

  fun shouldBlockPackage(context: Context, packageName: String): Boolean {
    if (!isEnabled(context)) return false
    if (packageName.isBlank()) return false
    if (!getBlockedPackages(context).contains(packageName)) return false
    val unlockUntilMs = getUnlockUntilMs(context)
    return System.currentTimeMillis() >= unlockUntilMs
  }
}
`,
  'FocusGateModule.kt': `package __PACKAGE__.focus

import android.content.Context
import android.content.Intent
import android.os.Build
import android.provider.Settings
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableArray
import java.util.TreeMap

class FocusGateModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "FocusGateModule"

  @ReactMethod
  fun syncSettings(settingsJson: String, promise: Promise) {
    try {
      val applied = FocusGatePrefs.applySettingsJson(reactContext, settingsJson)
      promise.resolve(applied)
    } catch (error: Exception) {
      promise.reject("FOCUS_GATE_SYNC_FAILED", error)
    }
  }

  @ReactMethod
  fun getServiceStatus(promise: Promise) {
    try {
      val map = Arguments.createMap()
      map.putBoolean("accessibilityEnabled", isAccessibilityServiceEnabled())
      map.putBoolean("usageAccessGranted", hasUsageStatsPermission())
      promise.resolve(map)
    } catch (error: Exception) {
      promise.reject("FOCUS_GATE_STATUS_FAILED", error)
    }
  }

  @ReactMethod
  fun openAccessibilitySettings() {
    val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).apply {
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    }
    reactContext.startActivity(intent)
  }

  @ReactMethod
  fun openUsageAccessSettings() {
    val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS).apply {
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    }
    reactContext.startActivity(intent)
  }

  @ReactMethod
  fun listInstalledApps(promise: Promise) {
    try {
      val pm = reactContext.packageManager
      val launcherIntent = Intent(Intent.ACTION_MAIN, null).apply {
        addCategory(Intent.CATEGORY_LAUNCHER)
      }
      val resolved = pm.queryIntentActivities(launcherIntent, 0)
      val byPackage = TreeMap<String, String>()
      for (item in resolved) {
        val packageName = item.activityInfo?.packageName ?: continue
        if (packageName == reactContext.packageName) continue
        val label = item.loadLabel(pm)?.toString() ?: packageName
        byPackage[packageName] = label
      }
      val array: WritableArray = Arguments.createArray()
      for ((packageName, label) in byPackage) {
        val row = Arguments.createMap()
        row.putString("packageName", packageName)
        row.putString("label", label)
        array.pushMap(row)
      }
      promise.resolve(array)
    } catch (error: Exception) {
      promise.reject("FOCUS_GATE_APPS_FAILED", error)
    }
  }

  private fun isAccessibilityServiceEnabled(): Boolean {
    val serviceId =
      "\${reactContext.packageName}/\${SocialAppBlockerAccessibilityService::class.java.name}"
    val enabled =
      Settings.Secure.getString(
        reactContext.contentResolver,
        Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES,
      ) ?: return false
    return enabled.split(':').any { it.equals(serviceId, ignoreCase = true) }
  }

  private fun hasUsageStatsPermission(): Boolean {
    return try {
      val appOps = reactContext.getSystemService(Context.APP_OPS_SERVICE) as android.app.AppOpsManager
      val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
        appOps.unsafeCheckOpNoThrow(
          "android:get_usage_stats",
          android.os.Process.myUid(),
          reactContext.packageName,
        )
      } else {
        appOps.checkOpNoThrow(
          "android:get_usage_stats",
          android.os.Process.myUid(),
          reactContext.packageName,
        )
      }
      mode == android.app.AppOpsManager.MODE_ALLOWED
    } catch (_: Exception) {
      false
    }
  }
}
`,
  'FocusGatePackage.kt': `package __PACKAGE__.focus

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class FocusGatePackage : ReactPackage {
  override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
    return listOf(FocusGateModule(reactContext))
  }

  override fun createViewManagers(
    reactContext: ReactApplicationContext
  ): List<ViewManager<*, *>> {
    return emptyList()
  }
}
`,
  'SocialAppBlockerAccessibilityService.kt': `package __PACKAGE__.focus

import android.accessibilityservice.AccessibilityService
import android.content.Intent
import android.view.accessibility.AccessibilityEvent

class SocialAppBlockerAccessibilityService : AccessibilityService() {
  private var lastBlockedPackage: String? = null
  private var lastBlockedAtMs: Long = 0L

  override fun onAccessibilityEvent(event: AccessibilityEvent?) {
    val packageName = event?.packageName?.toString() ?: return
    if (packageName == this.packageName) return
    if (packageName.startsWith("com.android.systemui")) return
    if (packageName.startsWith("com.google.android.permissioncontroller")) return

    if (!FocusGatePrefs.shouldBlockPackage(this, packageName)) {
      return
    }

    val now = System.currentTimeMillis()
    if (packageName == lastBlockedPackage && now - lastBlockedAtMs < 1200) {
      return
    }
    lastBlockedPackage = packageName
    lastBlockedAtMs = now

    val blockedAppLabel =
      try {
        val appInfo = packageManager.getApplicationInfo(packageName, 0)
        packageManager.getApplicationLabel(appInfo)?.toString()
      } catch (_: Exception) {
        null
      }

    val blockerIntent =
      Intent(this, SocialBlockerActivity::class.java).apply {
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP)
        putExtra("blockedPackage", packageName)
        if (!blockedAppLabel.isNullOrBlank()) {
          putExtra("blockedAppLabel", blockedAppLabel)
        }
      }
    startActivity(blockerIntent)
  }

  override fun onInterrupt() {}
}
`,
  'SocialBlockerActivity.kt': `package __PACKAGE__.focus

import android.app.Activity
import android.content.Intent
import android.graphics.Typeface
import android.os.Bundle
import android.view.Gravity
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import __PACKAGE__.MainActivity

class SocialBlockerActivity : Activity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    val blockedPackage = intent.getStringExtra("blockedPackage").orEmpty()
    val blockedAppLabel = intent.getStringExtra("blockedAppLabel")
    val appName =
      blockedAppLabel?.takeIf { it.isNotBlank() }
        ?: resolveAppLabel(blockedPackage)
        ?: blockedPackage.takeIf { it.isNotBlank() }
        ?: "this app"

    val root = LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      gravity = Gravity.CENTER
      setPadding(48, 48, 48, 48)
      setBackgroundColor(0xFF022C22.toInt())
    }

    val title = TextView(this).apply {
      text = "Take a prayer break"
      textSize = 24f
      setTextColor(0xFFFFFFFF.toInt())
      setTypeface(null, Typeface.BOLD)
      gravity = Gravity.CENTER
    }

    val message = TextView(this).apply {
      text = "\${appName} is blocked until you complete one prayer session in Oremus."
      textSize = 16f
      setTextColor(0xFFE2E8F0.toInt())
      gravity = Gravity.CENTER
      setPadding(0, 24, 0, 24)
    }

    val openPrayerButton = Button(this).apply {
      text = "Open Oremus"
      setOnClickListener {
        val openAppIntent =
          Intent(this@SocialBlockerActivity, MainActivity::class.java).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
          }
        startActivity(openAppIntent)
        finish()
      }
    }

    root.addView(title)
    root.addView(message)
    root.addView(openPrayerButton)
    setContentView(root)
  }

  private fun resolveAppLabel(packageName: String): String? {
    if (packageName.isBlank()) return null
    return try {
      val appInfo = packageManager.getApplicationInfo(packageName, 0)
      packageManager.getApplicationLabel(appInfo)?.toString()
    } catch (_: Exception) {
      null
    }
  }
}
`,
};

const serviceXml = `<?xml version="1.0" encoding="utf-8"?>
<accessibility-service
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:accessibilityEventTypes="typeWindowStateChanged|typeWindowsChanged"
    android:accessibilityFeedbackType="feedbackGeneric"
    android:canRetrieveWindowContent="false"
    android:description="@string/${FOCUS_GATE_SERVICE_DESCRIPTION_KEY}"
    android:notificationTimeout="100"
    android:accessibilityFlags="flagReportViewIds" />
`;

const ensurePermission = (
  manifest: Record<string, any>,
  name: string,
  extra: Record<string, string> = {},
) => {
  const key = 'uses-permission';
  manifest[key] = manifest[key] ?? [];
  const exists = manifest[key].some((entry: any) => entry?.$?.['android:name'] === name);
  if (!exists) {
    manifest[key].push({ $: { 'android:name': name, ...extra } });
  }
};

const removePermission = (manifest: Record<string, any>, name: string) => {
  const key = 'uses-permission';
  if (!Array.isArray(manifest[key])) {
    return;
  }
  manifest[key] = manifest[key].filter((entry: any) => entry?.$?.['android:name'] !== name);
};

const ensureQueryForLauncherApps = (manifest: Record<string, any>) => {
  manifest.queries = manifest.queries ?? [];
  const hasLauncherQuery = manifest.queries.some((query: any) =>
    (query.intent ?? []).some((intent: any) => {
      const actions = (intent.action ?? []).map((item: any) => item?.$?.['android:name']);
      const categories = (intent.category ?? []).map((item: any) => item?.$?.['android:name']);
      return (
        actions.includes('android.intent.action.MAIN') &&
        categories.includes('android.intent.category.LAUNCHER')
      );
    }),
  );
  if (!hasLauncherQuery) {
    manifest.queries.push({
      intent: [
        {
          action: [{ $: { 'android:name': 'android.intent.action.MAIN' } }],
          category: [{ $: { 'android:name': 'android.intent.category.LAUNCHER' } }],
        },
      ],
    });
  }
};

const ensureMetaData = (target: Record<string, any>, name: string, resource: string) => {
  target['meta-data'] = target['meta-data'] ?? [];
  const existing = target['meta-data'].find((entry: any) => entry?.$?.['android:name'] === name);
  if (existing) {
    existing.$['android:resource'] = resource;
  } else {
    target['meta-data'].push({ $: { 'android:name': name, 'android:resource': resource } });
  }
};

const writeIfChanged = async (filePath: string, content: string) => {
  try {
    const current = await fs.readFile(filePath, 'utf8');
    if (current === content) {
      return;
    }
  } catch {
    // ignore missing files
  }
  await fs.writeFile(filePath, content, 'utf8');
};

const withFocusGateAndroid: ConfigPlugin = (config) => {
  config = withAndroidManifest(config, (mod) => {
    const manifest = mod.modResults.manifest;
    manifest.$ = manifest.$ ?? {};
    manifest.$['xmlns:tools'] = manifest.$['xmlns:tools'] ?? 'http://schemas.android.com/tools';

    ensurePermission(manifest, 'android.permission.PACKAGE_USAGE_STATS', {
      'tools:ignore': 'ProtectedPermissions',
    });
    removePermission(manifest, 'android.permission.QUERY_ALL_PACKAGES');
    ensureQueryForLauncherApps(manifest);

    const app = manifest.application?.[0];
    if (app) {
      app.activity = app.activity ?? [];
      if (
        !app.activity.some(
          (entry: any) => entry?.$?.['android:name'] === '.focus.SocialBlockerActivity',
        )
      ) {
        app.activity.push({
          $: {
            'android:name': '.focus.SocialBlockerActivity',
            'android:exported': 'false',
            'android:excludeFromRecents': 'true',
            'android:launchMode': 'singleTask',
            'android:theme': '@style/Theme.App.SplashScreen',
          },
        });
      }

      app.service = app.service ?? [];
      let service = app.service.find(
        (entry: any) =>
          entry?.$?.['android:name'] === '.focus.SocialAppBlockerAccessibilityService',
      );
      if (!service) {
        service = { $: { 'android:name': '.focus.SocialAppBlockerAccessibilityService' } };
        app.service.push(service);
      }
      service.$ = service.$ ?? {};
      service.$['android:enabled'] = 'true';
      service.$['android:exported'] = 'false';
      service.$['android:permission'] = 'android.permission.BIND_ACCESSIBILITY_SERVICE';
      service['intent-filter'] = service['intent-filter'] ?? [
        {
          action: [{ $: { 'android:name': 'android.accessibilityservice.AccessibilityService' } }],
        },
      ];
      ensureMetaData(service, 'android.accessibilityservice', '@xml/social_blocker_service');
    }

    return mod;
  });

  config = withMainApplication(config, (mod) => {
    const androidPackage = config.android?.package;
    if (!androidPackage) {
      return mod;
    }

    let contents = mod.modResults.contents;
    const importLine = `import ${androidPackage}.focus.FocusGatePackage`;
    if (!contents.includes(importLine)) {
      const importAnchor = 'import expo.modules.ReactNativeHostWrapper';
      if (contents.includes(importAnchor)) {
        contents = contents.replace(importAnchor, `${importAnchor}\n${importLine}`);
      }
    }

    if (!contents.includes('add(FocusGatePackage())')) {
      contents = contents.replace(
        /PackageList\(this\)\.packages\.apply \{\n/,
        'PackageList(this).packages.apply {\n              add(FocusGatePackage())\n',
      );
    }

    mod.modResults.contents = contents;
    return mod;
  });

  config = withStringsXml(config, (mod) => {
    const resources = mod.modResults.resources ?? {};
    const strings = resources.string ?? [];
    const existing = strings.find(
      (entry: any) => entry?.$?.name === FOCUS_GATE_SERVICE_DESCRIPTION_KEY,
    );
    if (existing) {
      existing._ = FOCUS_GATE_SERVICE_DESCRIPTION;
    } else {
      strings.push({
        $: { name: FOCUS_GATE_SERVICE_DESCRIPTION_KEY },
        _: FOCUS_GATE_SERVICE_DESCRIPTION,
      });
    }
    resources.string = strings;
    mod.modResults.resources = resources;
    return mod;
  });

  config = withDangerousMod(config, [
    'android',
    async (mod) => {
      const androidPackage = config.android?.package;
      if (!androidPackage) {
        throw new Error('android.package is required to configure Focus Gate native files.');
      }

      const packagePath = androidPackage.split('.').join(path.sep);
      const javaDir = path.join(
        mod.modRequest.platformProjectRoot,
        'app',
        'src',
        'main',
        'java',
        packagePath,
        FOCUS_PACKAGE,
      );
      const xmlDir = path.join(
        mod.modRequest.platformProjectRoot,
        'app',
        'src',
        'main',
        'res',
        'xml',
      );

      await fs.mkdir(javaDir, { recursive: true });
      await fs.mkdir(xmlDir, { recursive: true });

      await Promise.all(
        Object.entries(focusFiles).map(async ([filename, template]) => {
          const content = template.replaceAll('__PACKAGE__', androidPackage);
          await writeIfChanged(path.join(javaDir, filename), content);
        }),
      );

      await writeIfChanged(path.join(xmlDir, 'social_blocker_service.xml'), serviceXml);
      return mod;
    },
  ]);

  return config;
};

export default withFocusGateAndroid;
