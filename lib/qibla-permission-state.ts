export type QiblaPermissionFlowState =
  | 'coldStart'
  | 'requesting'
  | 'granted'
  | 'deniedAskable'
  | 'blocked';

export type QiblaPermissionSyncSource = 'coldStart' | 'prompt' | 'settingsReturn';

type GetQiblaPermissionFlowStateInput = {
  status: 'granted' | 'denied' | 'undetermined' | null;
  canAskAgain: boolean;
  isRequesting: boolean;
};

export function getQiblaPermissionFlowState({
  status,
  canAskAgain,
  isRequesting,
}: GetQiblaPermissionFlowStateInput): QiblaPermissionFlowState {
  if (isRequesting) {
    return 'requesting';
  }

  if (status === null || status === 'undetermined') {
    return 'coldStart';
  }

  if (status === 'granted') {
    return 'granted';
  }

  return canAskAgain ? 'deniedAskable' : 'blocked';
}
