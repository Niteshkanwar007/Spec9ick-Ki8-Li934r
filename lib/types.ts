export type WorkflowStep =
  | 'specify'
  | 'clarify'
  | 'analyze'
  | 'plan'
  | 'checklist'
  | 'tasks'
  | 'implement';

export interface WorkflowStepMeta {
  id: WorkflowStep;
  number: number;
  name: string;
  command: string;
  nextStep: WorkflowStep | null;
  nextCommandTemplate: string;
  description: string;
  readsFrom: string;
  writesTo: string;
  iconName: string;
  createsChildIssues?: boolean;
  createsBranch?: boolean;
}

export interface LinearComment {
  id: string;
  body: string;
  createdAt: string;
  userName: string;
  userAvatar?: string;
  stepTag?: WorkflowStep;
  version?: number;
}

export interface LinearChildTask {
  id: string;
  identifier: string;
  title: string;
  description: string;
  estimate?: number;
  branchName: string;
  status: 'Todo' | 'In Progress' | 'Done';
  url: string;
}

export interface LinearIssue {
  id: string;
  identifier: string;
  title: string;
  description: string;
  branchName: string;
  url: string;
  state: {
    name: string;
    type: 'triage' | 'backlog' | 'unstarted' | 'started' | 'completed' | 'canceled';
    color: string;
  };
  priority: number; // 0=None, 1=Urgent, 2=High, 3=Medium, 4=Low
  teamKey: string;
  teamName: string;
  createdAt: string;
  comments: LinearComment[];
  children?: LinearChildTask[];
  parentIdentifier?: string;
}

export interface StepExecutionResult {
  step: WorkflowStep;
  version: number;
  commentMarkdown: string;
  nextCommand: string | null;
  copiedToClipboard: boolean;
  createdChildTasks?: LinearChildTask[];
  branchName?: string;
  gitCheckoutCommand?: string;
  summary: string;
}
