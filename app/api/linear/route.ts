import { NextRequest, NextResponse } from 'next/server';
import { testLinearConnection, fetchLinearIssueByKey } from '@/lib/linear-api';

export async function POST(req: NextRequest) {
  try {
    const { action, apiKey, issueKey } = await req.json();

    const keyToUse = apiKey || process.env.LINEAR_API_KEY;
    if (!keyToUse) {
      return NextResponse.json(
        { error: 'No Linear API key provided' },
        { status: 400 }
      );
    }

    if (action === 'test_connection') {
      const result = await testLinearConnection(keyToUse);
      return NextResponse.json(result);
    }

    if (action === 'fetch_issue') {
      if (!issueKey) {
        return NextResponse.json(
          { error: 'Missing issueKey parameter' },
          { status: 400 }
        );
      }
      const result = await fetchLinearIssueByKey(keyToUse, issueKey);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
