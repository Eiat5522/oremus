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
const FOCUS_GATE_BACKGROUND_ASSETS = {
  focus_gate_block_islam: ['docs', 'Oremus', 'App Blocking', 'Islam - Blocking BG.jpg'],
  focus_gate_block_christianity: [
    'docs',
    'Oremus',
    'App Blocking',
    'Christainity - Blocking BG.jpg',
  ],
  focus_gate_block_buddhism: ['docs', 'Oremus', 'App Blocking', 'Buddhist - Blocking BG.jpg'],
} as const;

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
  private const val KEY_TRADITION = "tradition"

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
    if (data.has(KEY_TRADITION) && !data.isNull(KEY_TRADITION)) {
      val tradition = data.optString(KEY_TRADITION, "").takeIf { it.isNotBlank() }
      editor.putString(KEY_TRADITION, tradition)
    } else {
      editor.remove(KEY_TRADITION)
    }
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

  fun getTradition(context: Context): String? =
    prefs(context).getString(KEY_TRADITION, null)?.takeIf { it.isNotBlank() }

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
import android.graphics.Bitmap
import android.graphics.Canvas
import android.os.Build
import android.provider.Settings
import android.util.Base64
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.WritableArray
import java.io.ByteArrayOutputStream
import java.util.TreeMap

data class InstalledAppRow(
  val label: String,
  val iconUri: String?,
)

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
  fun listInstalledApps(blockedPackages: ReadableArray?, promise: Promise) {
    try {
      val pm = reactContext.packageManager
      val launcherIntent = Intent(Intent.ACTION_MAIN, null).apply {
        addCategory(Intent.CATEGORY_LAUNCHER)
      }
      val resolved = pm.queryIntentActivities(launcherIntent, 0)
      val byPackage = TreeMap<String, InstalledAppRow>()
      for (item in resolved) {
        val packageName = item.activityInfo?.packageName ?: continue
        if (packageName == reactContext.packageName) continue
        val label = item.loadLabel(pm)?.toString() ?: packageName
        val iconUri = drawableToDataUri(item.loadIcon(pm))
        byPackage[packageName] = InstalledAppRow(label = label, iconUri = iconUri)
      }
      val array: WritableArray = Arguments.createArray()
      for ((packageName, app) in byPackage) {
        val row = Arguments.createMap()
        row.putString("packageName", packageName)
        row.putString("label", app.label)
        if (app.iconUri != null) {
          row.putString("iconUri", app.iconUri)
        }
        array.pushMap(row)
      }
      promise.resolve(array)
    } catch (error: Exception) {
      promise.reject("FOCUS_GATE_APPS_FAILED", error)
    }
  }

  private fun drawableToDataUri(drawable: android.graphics.drawable.Drawable?): String? {
    if (drawable == null) return null
    return try {
      val width = if (drawable.intrinsicWidth > 0) drawable.intrinsicWidth else 144
      val height = if (drawable.intrinsicHeight > 0) drawable.intrinsicHeight else 144
      val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
      val canvas = Canvas(bitmap)
      drawable.setBounds(0, 0, canvas.width, canvas.height)
      drawable.draw(canvas)

      val stream = ByteArrayOutputStream()
      bitmap.compress(Bitmap.CompressFormat.PNG, 100, stream)
      val encoded = Base64.encodeToString(stream.toByteArray(), Base64.NO_WRAP)
      stream.close()
      bitmap.recycle()
      "data:image/png;base64,$encoded"
    } catch (_: Exception) {
      null
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
import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.os.Build
import android.os.Bundle
import android.util.TypedValue
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import __PACKAGE__.MainActivity
import __PACKAGE__.R
import kotlin.math.roundToInt

class SocialBlockerActivity : Activity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
      window.statusBarColor = Color.TRANSPARENT
      window.navigationBarColor = Color.TRANSPARENT
    }
    @Suppress("DEPRECATION")
    window.decorView.systemUiVisibility =
      View.SYSTEM_UI_FLAG_LAYOUT_STABLE or
        View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN or
        View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION

    val blockedPackage = intent.getStringExtra("blockedPackage").orEmpty()
    val blockedAppLabel = intent.getStringExtra("blockedAppLabel")
    val appName =
      blockedAppLabel?.takeIf { it.isNotBlank() }
        ?: resolveAppLabel(blockedPackage)
        ?: blockedPackage.takeIf { it.isNotBlank() }
        ?: "this app"
    val content = getBlockerContent(FocusGatePrefs.getTradition(this), appName)

    val root = FrameLayout(this).apply {
      layoutParams =
        ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT)
    }

    val background = ImageView(this).apply {
      setImageResource(content.backgroundDrawableRes)
      scaleType = ImageView.ScaleType.CENTER_CROP
      layoutParams =
        FrameLayout.LayoutParams(
          ViewGroup.LayoutParams.MATCH_PARENT,
          ViewGroup.LayoutParams.MATCH_PARENT,
        )
    }

    val overlay = View(this).apply {
      this.background =
        GradientDrawable(
          GradientDrawable.Orientation.TOP_BOTTOM,
          intArrayOf(content.topOverlayColor, content.bottomOverlayColor),
        )
      layoutParams =
        FrameLayout.LayoutParams(
          ViewGroup.LayoutParams.MATCH_PARENT,
          ViewGroup.LayoutParams.MATCH_PARENT,
        )
    }

    val contentLayout = LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      gravity = Gravity.CENTER_HORIZONTAL
      setPadding(dp(24), dp(56), dp(24), dp(40))
      layoutParams =
        FrameLayout.LayoutParams(
          ViewGroup.LayoutParams.MATCH_PARENT,
          ViewGroup.LayoutParams.MATCH_PARENT,
        )
    }

    val spacer = View(this).apply {
      layoutParams =
        LinearLayout.LayoutParams(
          ViewGroup.LayoutParams.MATCH_PARENT,
          0,
          1f,
        )
    }

    val badge = TextView(this).apply {
      text = content.badgeLabel
      gravity = Gravity.CENTER
      setTextColor(content.badgeTextColor)
      setTextSize(TypedValue.COMPLEX_UNIT_SP, 13f)
      setPadding(dp(14), dp(8), dp(14), dp(8))
      this.background =
        GradientDrawable().apply {
          shape = GradientDrawable.RECTANGLE
          cornerRadius = dp(999).toFloat()
          setColor(content.badgeBackgroundColor)
          setStroke(dp(1), content.badgeStrokeColor)
        }
    }

    val title = TextView(this).apply {
      text = content.title
      setTextSize(TypedValue.COMPLEX_UNIT_SP, 29f)
      setTextColor(content.titleColor)
      typeface = Typeface.create(Typeface.SERIF, Typeface.BOLD)
      gravity = Gravity.CENTER
    }

    val message = TextView(this).apply {
      text = content.message
      setTextSize(TypedValue.COMPLEX_UNIT_SP, 16f)
      setTextColor(content.bodyColor)
      gravity = Gravity.CENTER
      setLineSpacing(0f, 1.35f)
    }

    val openPrayerButton = Button(this).apply {
      text = content.buttonLabel
      setTextColor(content.buttonTextColor)
      setTextSize(TypedValue.COMPLEX_UNIT_SP, 18f)
      typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
      textAlignment = View.TEXT_ALIGNMENT_CENTER
      stateListAnimator = null
      elevation = 0f
      minHeight = dp(58)
      minimumHeight = dp(58)
      this.background =
        GradientDrawable().apply {
          shape = GradientDrawable.RECTANGLE
          cornerRadius = dp(16).toFloat()
          setColor(content.buttonBackgroundColor)
          setStroke(dp(1), content.buttonStrokeColor)
        }
      setOnClickListener {
        val openAppIntent =
          Intent(this@SocialBlockerActivity, MainActivity::class.java).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
          }
        startActivity(openAppIntent)
        finish()
      }
    }

    val footer = TextView(this).apply {
      text = content.footerLabel
      gravity = Gravity.CENTER
      setTextColor(content.footerColor)
      setTextSize(TypedValue.COMPLEX_UNIT_SP, 13f)
    }

    contentLayout.addView(spacer)
    contentLayout.addView(
      badge,
      LinearLayout.LayoutParams(
        ViewGroup.LayoutParams.WRAP_CONTENT,
        ViewGroup.LayoutParams.WRAP_CONTENT,
      ).apply {
        bottomMargin = dp(22)
      },
    )
    contentLayout.addView(
      title,
      LinearLayout.LayoutParams(
        ViewGroup.LayoutParams.WRAP_CONTENT,
        ViewGroup.LayoutParams.WRAP_CONTENT,
      ).apply {
        bottomMargin = dp(14)
      },
    )
    contentLayout.addView(
      message,
      LinearLayout.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.WRAP_CONTENT,
      ).apply {
        bottomMargin = dp(24)
      },
    )
    contentLayout.addView(
      openPrayerButton,
      LinearLayout.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.WRAP_CONTENT,
      ).apply {
        bottomMargin = dp(16)
      },
    )
    contentLayout.addView(
      footer,
      LinearLayout.LayoutParams(
        ViewGroup.LayoutParams.WRAP_CONTENT,
        ViewGroup.LayoutParams.WRAP_CONTENT,
      ),
    )

    root.addView(background)
    root.addView(overlay)
    root.addView(contentLayout)
    setContentView(root)
  }

  private fun getBlockerContent(tradition: String?, appName: String): BlockerContent =
    when (tradition) {
      "islam" ->
        BlockerContent(
          badgeLabel = "$appName is paused",
          title = "Pause. Realign.",
          message = "You've chosen to protect your focus.\nComplete a session in Oremus to continue.",
          buttonLabel = "Begin Session",
          footerLabel = "Open Oremus to continue",
          backgroundDrawableRes = R.drawable.focus_gate_block_islam,
          topOverlayColor = 0x22000000,
          bottomOverlayColor = 0xCC041712.toInt(),
          badgeBackgroundColor = 0x263A7A67,
          badgeStrokeColor = 0x668DD8C2,
          badgeTextColor = 0xFFF2F8F4.toInt(),
          titleColor = 0xFFFFFFFF.toInt(),
          bodyColor = 0xE6EAF8F1.toInt(),
          buttonBackgroundColor = 0x995D826F.toInt(),
          buttonStrokeColor = 0xCCADCDBF.toInt(),
          buttonTextColor = 0xFFF4F5EF.toInt(),
          footerColor = 0xCCDEE9E2.toInt(),
        )
      "christianity" ->
        BlockerContent(
          badgeLabel = "$appName is paused",
          title = "Pause. Realign.",
          message = "You've chosen to protect your focus.\nComplete a session in Oremus to continue.",
          buttonLabel = "Begin Prayer",
          footerLabel = "Open Oremus to continue",
          backgroundDrawableRes = R.drawable.focus_gate_block_christianity,
          topOverlayColor = 0x12000000,
          bottomOverlayColor = 0xD93B1917.toInt(),
          badgeBackgroundColor = 0x26E0AA69,
          badgeStrokeColor = 0x66F3CC95,
          badgeTextColor = 0xFFFFF4E8.toInt(),
          titleColor = 0xFFF9E1C4.toInt(),
          bodyColor = 0xE6F6E7D6.toInt(),
          buttonBackgroundColor = 0xCCB86A38.toInt(),
          buttonStrokeColor = 0xFFE2A56A.toInt(),
          buttonTextColor = 0xFFFFF0DE.toInt(),
          footerColor = 0xCCF7DAB8.toInt(),
        )
      "buddhism" ->
        BlockerContent(
          badgeLabel = "$appName is paused",
          title = "Pause. Realign.",
          message = "You've chosen to protect your focus.\nComplete a session in Oremus to continue.",
          buttonLabel = "Begin Meditation",
          footerLabel = "Open Oremus to continue",
          backgroundDrawableRes = R.drawable.focus_gate_block_buddhism,
          topOverlayColor = 0x18000000,
          bottomOverlayColor = 0xCC4F2312.toInt(),
          badgeBackgroundColor = 0x26E5B678,
          badgeStrokeColor = 0x66F3CF9A,
          badgeTextColor = 0xFFFFF0E2.toInt(),
          titleColor = 0xFFF7DEC0.toInt(),
          bodyColor = 0xE6F8E8D5.toInt(),
          buttonBackgroundColor = 0xCCB8722F.toInt(),
          buttonStrokeColor = 0xFFE1B36E.toInt(),
          buttonTextColor = 0xFFFFF0DE.toInt(),
          footerColor = 0xCCF4DBBD.toInt(),
        )
      else ->
        BlockerContent(
          badgeLabel = "$appName is paused",
          title = "Pause. Realign.",
          message = "You've chosen to protect your focus.\nComplete a session in Oremus to continue.",
          buttonLabel = "Begin Session",
          footerLabel = "Open Oremus to continue",
          backgroundDrawableRes = R.drawable.focus_gate_block_islam,
          topOverlayColor = 0x22000000,
          bottomOverlayColor = 0xCC041712.toInt(),
          badgeBackgroundColor = 0x263A7A67,
          badgeStrokeColor = 0x668DD8C2,
          badgeTextColor = 0xFFF2F8F4.toInt(),
          titleColor = 0xFFFFFFFF.toInt(),
          bodyColor = 0xE6EAF8F1.toInt(),
          buttonBackgroundColor = 0x995D826F.toInt(),
          buttonStrokeColor = 0xCCADCDBF.toInt(),
          buttonTextColor = 0xFFF4F5EF.toInt(),
          footerColor = 0xCCDEE9E2.toInt(),
        )
    }

  private fun dp(value: Int): Int = (value * resources.displayMetrics.density).roundToInt()

  private fun resolveAppLabel(packageName: String): String? {
    if (packageName.isBlank()) return null
    return try {
      val appInfo = packageManager.getApplicationInfo(packageName, 0)
      packageManager.getApplicationLabel(appInfo)?.toString()
    } catch (_: Exception) {
      null
    }
  }

  private data class BlockerContent(
    val badgeLabel: String,
    val title: String,
    val message: String,
    val buttonLabel: String,
    val footerLabel: String,
    val backgroundDrawableRes: Int,
    val topOverlayColor: Int,
    val bottomOverlayColor: Int,
    val badgeBackgroundColor: Int,
    val badgeStrokeColor: Int,
    val badgeTextColor: Int,
    val titleColor: Int,
    val bodyColor: Int,
    val buttonBackgroundColor: Int,
    val buttonTextColor: Int,
    val buttonStrokeColor: Int,
    val footerColor: Int,
  )
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

const copyBinaryIfChanged = async (sourcePath: string, targetPath: string) => {
  const [source, current] = await Promise.all([
    fs.readFile(sourcePath),
    fs.readFile(targetPath).catch(() => null),
  ]);
  if (current && Buffer.compare(source, current) === 0) {
    return;
  }
  await fs.copyFile(sourcePath, targetPath);
};

const removeConflictingDrawables = async (resourceBasePath: string) => {
  await Promise.all(
    ['.png', '.jpg', '.jpeg', '.webp'].map(async (extension) => {
      await fs.rm(`${resourceBasePath}${extension}`, { force: true }).catch(() => {});
    }),
  );
};

const BLOCKER_THEME_XML = `  <style name="Theme.App.Blocker" parent="Theme.AppCompat.DayNight.NoActionBar">
    <item name="android:windowNoTitle">true</item>
    <item name="windowNoTitle">true</item>
    <item name="android:windowActionBar">false</item>
    <item name="windowActionBar">false</item>
    <item name="android:statusBarColor">@android:color/transparent</item>
    <item name="android:navigationBarColor">@android:color/transparent</item>
    <item name="android:windowLayoutInDisplayCutoutMode">shortEdges</item>
    <item name="android:windowDrawsSystemBarBackgrounds">true</item>
  </style>
`;

const ensureBlockerThemeInStylesXml = async (stylesPath: string) => {
  let current: string;
  try {
    current = await fs.readFile(stylesPath, 'utf8');
  } catch (error: any) {
    if (error?.code === 'ENOENT') {
      // Create minimal styles.xml with the blocker theme
      const minimal = `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n${BLOCKER_THEME_XML}</resources>\n`;
      await fs.writeFile(stylesPath, minimal, 'utf8');
      return;
    }
    throw error;
  }

  if (current.includes('name="Theme.App.Blocker"')) {
    return;
  }

  if (!current.includes('</resources>')) {
    throw new Error(`Unable to add Theme.App.Blocker to ${stylesPath}.`);
  }

  const next = current.replace('</resources>', `${BLOCKER_THEME_XML}</resources>`);
  await fs.writeFile(stylesPath, next, 'utf8');
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
            'android:theme': '@style/Theme.App.Blocker',
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
      const valuesDir = path.join(
        mod.modRequest.platformProjectRoot,
        'app',
        'src',
        'main',
        'res',
        'values',
      );
      const drawableDir = path.join(
        mod.modRequest.platformProjectRoot,
        'app',
        'src',
        'main',
        'res',
        'drawable-nodpi',
      );

      await fs.mkdir(javaDir, { recursive: true });
      await fs.mkdir(xmlDir, { recursive: true });
      await fs.mkdir(valuesDir, { recursive: true });
      await fs.mkdir(drawableDir, { recursive: true });

      await Promise.all(
        Object.entries(focusFiles).map(async ([filename, template]) => {
          const content = template.replaceAll('__PACKAGE__', androidPackage);
          await writeIfChanged(path.join(javaDir, filename), content);
        }),
      );

      await Promise.all(
        Object.entries(FOCUS_GATE_BACKGROUND_ASSETS).map(async ([resourceName, sourceParts]) => {
          const sourcePath = path.join(mod.modRequest.projectRoot, ...sourceParts);
          const targetExtension = path.extname(sourcePath) || '.png';
          const targetBasePath = path.join(drawableDir, resourceName);
          const targetPath = `${targetBasePath}${targetExtension}`;
          await removeConflictingDrawables(targetBasePath);
          await copyBinaryIfChanged(sourcePath, targetPath);
        }),
      );

      await writeIfChanged(path.join(xmlDir, 'social_blocker_service.xml'), serviceXml);
      await ensureBlockerThemeInStylesXml(path.join(valuesDir, 'styles.xml'));
      return mod;
    },
  ]);

  return config;
};

export default withFocusGateAndroid;
