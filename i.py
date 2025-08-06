import requests

API_TOKEN = "api-nhvap27hnnb6igtgizlu76mcuro5"  # Replace with your real token
TASK_ID = "T376228"
PHABRICATOR_API = "https://phabricator.wikimedia.org/api"

def get_task_details(task_id):
    numeric_id = task_id.lstrip("T")
    response = requests.post(
        f"{PHABRICATOR_API}/maniphest.search",
        data={
            "api.token": API_TOKEN,
            "constraints[ids][0]": numeric_id
        }
    )
    return response.json()["result"]["data"][0]  # First match

def get_task_comments(task_id):
    response = requests.post(
        f"{PHABRICATOR_API}/transaction.search",
        data={
            "api.token": API_TOKEN,
            "objectIdentifier": task_id
        }
    )
    return response.json()["result"]["data"]

def summarize_task(task_data):
    fields = task_data["fields"]
    author = fields["authorPHID"]
    tags = [project["name"] for project in fields.get("projects", [])]
    return {
        "title": fields["name"],
        "description": fields["description"]["raw"],
        "status": fields["status"]["name"],
        "priority": fields["priority"]["name"],
        "authorPHID": author,
        "created": fields["dateCreated"],
        "tags": tags
    }


def get_users_info(phids):
    response = requests.post(
        f"{PHABRICATOR_API}/user.search",
        data={
            "api.token": API_TOKEN,
            "constraints[phids][]": phids
        }
    )
    user_map = {}
    for user in response.json()["result"]["data"]:
        user_map[user["phid"]] = {
            "username": user["fields"]["username"],
            "realName": user["fields"]["realName"]
        }
    return user_map

# --- MAIN FLOW ---

task = get_task_details(TASK_ID)
comments = get_task_comments(TASK_ID)

# Collect PHIDs of all users
phids = {task["fields"]["authorPHID"]}
for tx in comments:
    if tx["type"] == "comment":
        phids.add(tx["authorPHID"])

user_info = get_users_info(list(phids))
summary = summarize_task(task)

# Display results
print("📝 Title:", summary["title"])
print("👤 Author:", user_info[summary["authorPHID"]]["realName"])
print("🏷️ Tags:", summary["tags"])
print("⚠️ Priority:", summary["priority"])
print("📄 Description:\n", summary["description"])
print("\n💬 Comments:\n")

for tx in comments:
    if tx["type"] == "comment":
        phid = tx["authorPHID"]
        author = user_info.get(phid, {"realName": "System/Unknown"})["realName"]
        comment = tx["comments"][0]["content"]["raw"]
        print(f"- {author}: {comment}")

