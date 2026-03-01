import { useCallback, useEffect, useRef, useState } from 'react';

type CameraPermissionStatus = 'granted' | 'denied' | 'undetermined';

type CameraPermissionResponse = {
  canAskAgain: boolean;
  expires: 'never';
  granted: boolean;
  status: CameraPermissionStatus;
};

type CameraModule = {
  getCameraPermissionsAsync: () => Promise<CameraPermissionResponse>;
  requestCameraPermissionsAsync: () => Promise<CameraPermissionResponse>;
};

const unavailablePermission: CameraPermissionResponse = {
  canAskAgain: false,
  expires: 'never',
  granted: false,
  status: 'denied',
};

export function useSafeCameraPermissions() {
  const [permission, setPermission] = useState<CameraPermissionResponse | null>(null);
  const modulePromiseRef = useRef<Promise<CameraModule | null> | null>(null);

  const loadCameraModule = useCallback(async () => {
    if (!modulePromiseRef.current) {
      modulePromiseRef.current = import('expo-camera')
        .then((module) => {
          if (
            typeof module.getCameraPermissionsAsync === 'function' &&
            typeof module.requestCameraPermissionsAsync === 'function'
          ) {
            return module as CameraModule;
          }
          return null;
        })
        .catch(() => null);
    }
    return modulePromiseRef.current;
  }, []);

  useEffect(() => {
    let isMounted = true;

    const syncPermission = async () => {
      const cameraModule = await loadCameraModule();
      if (!cameraModule) {
        if (isMounted) {
          setPermission(unavailablePermission);
        }
        return;
      }

      try {
        const nextPermission = await cameraModule.getCameraPermissionsAsync();
        if (isMounted) {
          setPermission(nextPermission);
        }
      } catch {
        if (isMounted) {
          setPermission(unavailablePermission);
        }
      }
    };

    void syncPermission();

    return () => {
      isMounted = false;
    };
  }, [loadCameraModule]);

  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const requestPermission = useCallback(async () => {
    const cameraModule = await loadCameraModule();
    if (!cameraModule) {
      if (isMountedRef.current) {
        setPermission(unavailablePermission);
      }
      return unavailablePermission;
    }

    try {
      const nextPermission = await cameraModule.requestCameraPermissionsAsync();
      if (isMountedRef.current) {
        setPermission(nextPermission);
      }
      return nextPermission;
    } catch {
      if (isMountedRef.current) {
        setPermission(unavailablePermission);
      }
      return unavailablePermission;
    }
  }, [loadCameraModule]);

  return [permission, requestPermission] as const;
}
