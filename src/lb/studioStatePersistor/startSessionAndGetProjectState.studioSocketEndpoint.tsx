export default function* startSessionAndGetProjectState(
  projectPath: string,
): Generator_<
  $FixMe,
  | {type: 'Success'; sessionId: string; projectState: object}
  | {type: 'Error'; errorType: 'projectNotRecognised'},
  $FixMe
> {
  const projectStatePersistor = getProjectStatePersistor()
  
}
