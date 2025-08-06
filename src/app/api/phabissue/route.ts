import { NextRequest, NextResponse } from "next/server";

const PHABRICATOR_API = "https://phabricator.wikimedia.org/api";
const API_TOKEN =
  process.env.PHABRICATOR_API_TOKEN || "api-nhvap27hnnb6igtgizlu76mcuro5";

const fetchPhabricatorData = async (taskId: string) => {
  const numericId = taskId.replace("T", "");

  const taskRes = await fetch(`${PHABRICATOR_API}/maniphest.search`, {
    method: "POST",
    body: new URLSearchParams({
      "api.token": API_TOKEN,
      "constraints[ids][0]": numericId,
    }),
  });

  const taskJson = await taskRes.json();
  const task = taskJson.result.data[0];

  const commentsRes = await fetch(`${PHABRICATOR_API}/transaction.search`, {
    method: "POST",
    body: new URLSearchParams({
      "api.token": API_TOKEN,
      objectIdentifier: taskId,
    }),
  });

  const commentsJson = await commentsRes.json();
  const comments = commentsJson.result.data;

  // Extract unique PHIDs
  const phids = new Set<string>();
  phids.add(task.fields.authorPHID);
  comments.forEach((tx: any) => {
    if (tx.type === "comment") phids.add(tx.authorPHID);
  });

  const usersRes = await fetch(`${PHABRICATOR_API}/user.search`, {
    method: "POST",
    body: new URLSearchParams({
      "api.token": API_TOKEN,
      ...Array.from(phids).reduce((acc, phid, i) => {
        acc[`constraints[phids][${i}]`] = phid;
        return acc;
      }, {} as Record<string, string>),
    }),
  });

  const usersJson = await usersRes.json();
  const users = Object.fromEntries(
    usersJson.result.data.map((u: any) => [
      u.phid,
      { username: u.fields.username, realName: u.fields.realName },
    ])
  );

  return {
    task,
    comments,
    users,
  };
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const taskId = body.taskId;
  console.log(req.body);
  if (!taskId) return NextResponse.json({ error: "Task ID missing" });

  try {
    const result = await fetchPhabricatorData(taskId);
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch Phabricator data" });
  }
}
