import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Bell, MessageSquare, Star, Calendar, Users, AlertCircle } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import NotificationsClient from "./NotificationsClient";
import BackHeader from "@/components/layout/BackHeader";

const TYPE_CONFIG: Record<string, { icon: any; color: string; bg: string }> = {
  MATCH: { icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
  MESSAGE: { icon: MessageSquare, color: "text-green-500", bg: "bg-green-50" },
  REVIEW: { icon: Star, color: "text-yellow-500", bg: "bg-yellow-50" },
  CARE: { icon: Calendar, color: "text-primary-500", bg: "bg-primary-50" },
  SYSTEM: { icon: AlertCircle, color: "text-gray-500", bg: "bg-gray-100" },
};

async function getNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

function groupByDate(notifications: any[]) {
  const groups: Record<string, any[]> = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  for (const n of notifications) {
    const date = new Date(n.createdAt);
    date.setHours(0, 0, 0, 0);
    let key: string;
    if (date.getTime() === today.getTime()) key = "오늘";
    else if (date.getTime() === yesterday.getTime()) key = "어제";
    else key = date.toLocaleDateString("ko-KR", { month: "long", day: "numeric" });
    if (!groups[key]) groups[key] = [];
    groups[key].push(n);
  }
  return groups;
}

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const user = session.user as any;

  const notifications = await getNotifications(user.id);
  const grouped = groupByDate(notifications);
  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <BackHeader title="알림" fallbackHref="/home" />

      {notifications.length === 0 ? (
        <EmptyState
          icon={<Bell size={40} />}
          title="새로운 알림이 없습니다"
          className="flex-1"
        />
      ) : (
        <div className="py-2">
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              <p className="px-4 py-2 text-xs font-semibold text-gray-400">{date}</p>
              <div className="space-y-px">
                {items.map((notification: any) => {
                  const config = TYPE_CONFIG[notification.type] || TYPE_CONFIG.SYSTEM;
                  const Icon = config.icon;
                  return (
                    <div
                      key={notification.id}
                      className={`flex items-start gap-3 px-4 py-4 bg-white hover:bg-gray-50 transition-colors cursor-pointer ${
                        !notification.isRead ? "border-l-2 border-primary-400" : ""
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full ${config.bg} flex items-center justify-center flex-shrink-0`}>
                        <Icon size={18} className={config.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-semibold leading-tight ${
                            !notification.isRead ? "text-gray-900" : "text-gray-700"
                          }`}>
                            {notification.title}
                          </p>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{notification.body}</p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {new Date(notification.createdAt).toLocaleTimeString("ko-KR", {
                            hour: "2-digit", minute: "2-digit"
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
