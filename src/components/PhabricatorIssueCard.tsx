import React from "react";
import { AlertCircle, User, MessageSquare, Tag } from "lucide-react";

const PhabricatorIssueCard = ({ data }: { data: any }) => {
  if (!data || !data.task) return null;

  const { task, users } = data;

  return (
    <div className="bg-white/5 border border-gray-700 rounded-2xl p-6 shadow-lg text-white">
      <h3 className="text-2xl font-bold text-purple-300 mb-4 flex items-center gap-3">
        <AlertCircle className="w-7 h-7" />
        {task.id}: {task.fields.name}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm">
        <div className="bg-black/20 p-3 rounded-lg flex items-center gap-2">
          <Tag className="w-4 h-4 text-gray-400" /> <strong>Status:</strong>{" "}
          {task.fields.status.name}
        </div>
        <div className="bg-black/20 p-3 rounded-lg flex items-center gap-2">
          <Tag className="w-4 h-4 text-gray-400" /> <strong>Priority:</strong>{" "}
          {task.fields.priority.name}
        </div>
        <div className="bg-black/20 p-3 rounded-lg flex items-center gap-2">
          <User className="w-4 h-4 text-gray-400" /> <strong>Author:</strong>{" "}
          {users[task.fields.authorPHID]?.realName}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-gray-300 mb-2">Description:</h4>
          <p className="text-gray-300 whitespace-pre-wrap bg-black/30 p-4 rounded-md text-sm leading-relaxed">
            {task.fields.description.raw}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PhabricatorIssueCard;
