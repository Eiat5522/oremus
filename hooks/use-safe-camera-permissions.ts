import { useCallback, useEffect, useRef, useState } from 'react';

import {
  getQiblaPermissionFlowState,
  type QiblaPermissionFlowState,
  type QiblaPermissionSyncSource,
} from '@/lib/qibla-permission-state';

type CameraPermissionStatus = 'granted' | 'denied' | 'undetermined';

type CameraPermissionResponse = {
  canAskAgain: boolean;
  expires: 'never';
  granted: boolean;
  status: CameraPermissionStatus;
};

type CameraClassCompat = {
  getCameraPermissionsAsync: () => Promise<CameraPermissionResponse>;
  requestCameraPermissionsAsync: () => Promise<CameraPermissionResponse>;
};

type CameraModule = {
  Camera?: CameraClassCompat;
};

export type CameraPermissionFailureCode =
  | 'camera_module_load_failed'
  | 'camera_permission_read_failed'
  | 'camera_permission_request_failed';

export type CameraPermissionFailure = {
  code: CameraPermissionFailureCode;
  message: string;
  source: QiblaPermissionSyncSource;
};

const unavailablePermission: CameraPermissionResponse = {
  canAskAgain: false,
  expires: 'never',
  granted: false,
  status: 'denied',
};

export function useSafeCameraPermissions() {
  const [permission, setPermission] = useState<CameraPermissionResponse | null>(null);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [permissionFlowState, setPermissionFlowState] = useState<QiblaPermissionFlowState>(
    'coldStart',
  );
  const [permissionSyncSource, setPermissionSyncSource] =
    useState<QiblaPermissionSyncSource>('coldStart');
  const [lastPermissionFailure, setLastPermissionFailure] = useState<CameraPermissionFailure | null>(
    null,
  );
  const modulePromiseRef = useRef<Promise<CameraClassCompat | null> | null>(null);
  const isMountedRef = useRef(true);

  const applyPermissionState = useCallback(
    (nextPermission: CameraPermissionResponse | null, source: QiblaPermissionSyncSource) => {
      setPermission(nextPermission);
      setPermissionSyncSource(source);
      setPermissionFlowState(
        getQiblaPermissionFlowState({
          status: nextPermission?.status ?? null,
          canAskAgain: nextPermission?.canAskAgain ?? false,
          isRequesting: false,
        }),
      );
    },
    [],
  );

  const setFailureState = useCallback((failure: CameraPermissionFailure) => {
    if (!isMountedRef.current) {
      return;
    }

    setLastPermissionFailure(failure);
    applyPermissionState(unavailablePermission, failure.source);
  }, [applyPermissionState]);

  const loadCameraModule = useCallback(async () => {
    if (!modulePromiseRef.current) {
      modulePromiseRef.current = import('expo-camera')
        .then((module) => {
          const cam = (module as CameraModule).Camera;
          if (
            cam &&
            typeof cam.getCameraPermissionsAsync === 'function' &&
            typeof cam.requestCameraPermissionsAsync === 'function'
          ) {
            return cam;
          }
          return null;
        })
        .catch((error) => {
          setFailureState({
            code: 'camera_module_load_failed',
            message:
              error instanceof Error ? error.message : 'Unable to load the camera module.',
            source: 'coldStart',
          });
          return null;
        });
    }
    return modulePromiseRef.current;
  }, [setFailureState]);

  useEffect(() => {
    let isMounted = true;

    const syncPermission = async () => {
      const cameraModule = await loadCameraModule();
      if (!cameraModule) {
        return;
      }

      try {
        const nextPermission = await cameraModule.getCameraPermissionsAsync();
        if (isMounted) {
          applyPermissionState(nextPermission, 'coldStart');
          setLastPermissionFailure(null);
        }
      } catch (error) {
        if (isMounted) {
          setFailureState({
            code: 'camera_permission_read_failed',
            message:
              error instanceof Error ? error.message : 'Unable to read camera permissions.',
            source: 'coldStart',
          });
        }
      }
    };

    void syncPermission();

    return () => {
      isMounted = false;
    };
  }, [applyPermissionState, loadCameraModule, setFailureState]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const refreshPermission = useCallback(
    async (source: QiblaPermissionSyncSource = 'settingsReturn') => {
      const cameraModule = await loadCameraModule();
      if (!cameraModule) {
        return unavailablePermission;
      }

      try {
        const nextPermission = await cameraModule.getCameraPermissionsAsync();
        if (isMountedRef.current) {
          applyPermissionState(nextPermission, source);
          setLastPermissionFailure(null);
        }
        return nextPermission;
      } catch (error) {
        setFailureState({
          code: 'camera_permission_read_failed',
          message: error instanceof Error ? error.message : 'Unable to refresh camera permissions.',
          source,
        });
        return unavailablePermission;
      }
    },
    [applyPermissionState, loadCameraModule, setFailureState],
  );

  const requestPermission = useCallback(async () => {
    setIsRequestingPermission(true);
    setPermissionFlowState('requesting');
    setPermissionSyncSource('prompt');
    const cameraModule = await loadCameraModule();
    if (!cameraModule) {
      if (isMountedRef.current) {
        setIsRequestingPermission(false);
      }
      return unavailablePermission;
    }

    try {
      const nextPermission = await cameraModule.requestCameraPermissionsAsync();
      if (isMountedRef.current) {
        applyPermissionState(nextPermission, 'prompt');
        setLastPermissionFailure(null);
      }
      return nextPermission;
    } catch (error) {
      setFailureState({
        code: 'camera_permission_request_failed',
        message: error instanceof Error ? error.message : 'Unable to request camera permission.',
        source: 'prompt',
      });
      return unavailablePermission;
    } finally {
      if (isMountedRef.current) {
        setIsRequestingPermission(false);
      }
    }
  }, [applyPermissionState, loadCameraModule, setFailureState]);

  return [
    permission,
    requestPermission,
    refreshPermission,
    {
      permissionFlowState,
      permissionSyncSource,
      isRequestingPermission,
      lastPermissionFailure,
    },
  ] as const;
}
