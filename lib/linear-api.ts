import { LinearIssue, LinearComment, LinearChildTask } from './types';

const LINEAR_GRAPHQL_ENDPOINT = 'https://api.linear.app/graphql';

export interface LinearApiViewer {
  id: string;
  name: string;
  email: string;
}

export interface LinearApiTeam {
  id: string;
  key: string;
  name: string;
}

/**
 * Executes a GraphQL query/mutation against Linear's official API
 */
export async function executeLinearGraphQL<T = any>(
  apiKey: string,
  query: string,
  variables: Record<string, any> = {}
): Promise<{ data?: T; errors?: Array<{ message: string }> }> {
  try {
    const response = await fetch(LINEAR_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: apiKey.startsWith('Bearer ') ? apiKey : `${apiKey}`,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      const text = await response.text();
      return {
        errors: [{ message: `HTTP ${response.status}: ${text || response.statusText}` }],
      };
    }

    const result = await response.json();
    return result;
  } catch (err: any) {
    return {
      errors: [{ message: err.message || 'Failed to reach Linear API' }],
    };
  }
}

/**
 * Verify API Key and get viewer info + available teams
 */
export async function testLinearConnection(apiKey: string): Promise<{
  success: boolean;
  viewer?: LinearApiViewer;
  teams?: LinearApiTeam[];
  error?: string;
}> {
  const query = `
    query TestConnection {
      viewer {
        id
        name
        email
      }
      teams(first: 20) {
        nodes {
          id
          key
          name
        }
      }
    }
  `;

  const res = await executeLinearGraphQL(apiKey, query);
  if (res.errors && res.errors.length > 0) {
    return { success: false, error: res.errors[0].message };
  }

  if (!res.data || !res.data.viewer) {
    return { success: false, error: 'Invalid response from Linear API' };
  }

  return {
    success: true,
    viewer: res.data.viewer,
    teams: res.data.teams?.nodes || [],
  };
}

/**
 * Fetch an issue by key (e.g. "ENG-101") from Linear
 */
export async function fetchLinearIssueByKey(
  apiKey: string,
  issueKey: string
): Promise<{ success: boolean; issue?: LinearIssue; error?: string }> {
  const query = `
    query GetIssueByKey($id: String!) {
      issue(id: $id) {
        id
        identifier
        title
        description
        branchName
        url
        priority
        createdAt
        team {
          id
          key
          name
        }
        state {
          name
          type
          color
        }
        comments(first: 50) {
          nodes {
            id
            body
            createdAt
            user {
              name
            }
          }
        }
        children(first: 50) {
          nodes {
            id
            identifier
            title
            description
            branchName
            url
            state {
              name
            }
          }
        }
      }
    }
  `;

  const res = await executeLinearGraphQL(apiKey, query, { id: issueKey });
  if (res.errors && res.errors.length > 0) {
    return { success: false, error: res.errors[0].message };
  }

  const raw = res.data?.issue;
  if (!raw) {
    return { success: false, error: `Issue ${issueKey} not found in Linear` };
  }

  const formatted: LinearIssue = {
    id: raw.id,
    identifier: raw.identifier,
    title: raw.title,
    description: raw.description || '',
    branchName: raw.branchName || `9icksA/${raw.identifier.toLowerCase()}-task`,
    url: raw.url,
    priority: raw.priority || 0,
    teamKey: raw.team?.key || 'ENG',
    teamName: raw.team?.name || 'Engineering',
    createdAt: raw.createdAt,
    state: {
      name: raw.state?.name || 'Todo',
      type: raw.state?.type || 'unstarted',
      color: raw.state?.color || '#cbd5e1',
    },
    comments: (raw.comments?.nodes || []).map((c: any): LinearComment => ({
      id: c.id,
      body: c.body,
      createdAt: c.createdAt,
      userName: c.user?.name || 'Linear User',
    })),
    children: (raw.children?.nodes || []).map((ch: any): LinearChildTask => ({
      id: ch.id,
      identifier: ch.identifier,
      title: ch.title,
      description: ch.description || '',
      branchName: ch.branchName || `9icksA/${ch.identifier.toLowerCase()}-task`,
      status: (ch.state?.name as any) || 'Todo',
      url: ch.url,
    })),
  };

  return { success: true, issue: formatted };
}

/**
 * Post a comment to a Linear issue
 */
export async function postLinearComment(
  apiKey: string,
  issueId: string,
  body: string
): Promise<{ success: boolean; commentId?: string; error?: string }> {
  const mutation = `
    mutation CreateComment($issueId: String!, $body: String!) {
      commentCreate(input: { issueId: $issueId, body: $body }) {
        success
        comment {
          id
        }
      }
    }
  `;

  const res = await executeLinearGraphQL(apiKey, mutation, { issueId, body });
  if (res.errors && res.errors.length > 0) {
    return { success: false, error: res.errors[0].message };
  }

  return {
    success: true,
    commentId: res.data?.commentCreate?.comment?.id,
  };
}

/**
 * Create a child sub-issue in Linear under a parent issue
 */
export async function createLinearChildIssue(
  apiKey: string,
  params: {
    parentId: string;
    teamId: string;
    title: string;
    description: string;
    estimate?: number;
  }
): Promise<{ success: boolean; childIssue?: LinearChildTask; error?: string }> {
  const mutation = `
    mutation CreateSubIssue($input: IssueCreateInput!) {
      issueCreate(input: $input) {
        success
        issue {
          id
          identifier
          title
          description
          branchName
          url
          state {
            name
          }
        }
      }
    }
  `;

  const input: any = {
    parentId: params.parentId,
    teamId: params.teamId,
    title: params.title,
    description: params.description,
  };
  if (params.estimate !== undefined) {
    input.estimate = params.estimate;
  }

  const res = await executeLinearGraphQL(apiKey, mutation, { input });
  if (res.errors && res.errors.length > 0) {
    return { success: false, error: res.errors[0].message };
  }

  const raw = res.data?.issueCreate?.issue;
  if (!raw) {
    return { success: false, error: 'Failed to create child issue' };
  }

  const child: LinearChildTask = {
    id: raw.id,
    identifier: raw.identifier,
    title: raw.title,
    description: raw.description || '',
    branchName: raw.branchName || `9icksA/${raw.identifier.toLowerCase()}-task`,
    status: (raw.state?.name as any) || 'Todo',
    url: raw.url,
    estimate: params.estimate,
  };

  return { success: true, childIssue: child };
}
