import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { MessageSquare } from "lucide-react";

async function getChatRooms(userId: string, role: string) {
  if (role === "GUARDIAN") {
    const guardianProfile = await prisma.guardianProfile.findUnique({ where: { userId } });
    if (!guardianProfile) return [];
    return prisma.match.findMany({
      where: {
        guardianId: guardianProfile.id,
        status: { notIn: ["REJECTED", "CANCELLED"] },
      },
      orderBy: { updatedAt: "desc" },
      include: {
        caregiver: { include: { user: { select: { id: true, name: true, profileImage: true } } } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });
  } else {
    const caregiverProfile = await prisma.caregiverProfile.findUnique({ where: { userId } });
    if (!caregiverProfile) return [];
    return prisma.match.findMany({
      where: {
        caregiverId: caregiverProfile.id,
        status: { notIn: ["REJECTED", "CANCELLED"] },
      },
      orderBy: { updatedAt: "desc" },
      include: {
        guardian: { include: { user: { select: { id: true, name: true, profileImage: true } } } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });
  }
}

export default async function ChatPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const user = session.user as any;

  const matches = await getChatRooms(user.id, user.role);
  const isGuardian = user.role === "GUARDIAN";

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="bg-white px-4 py-4 border-b border-gray-100">
        <h1 className="text-base font-bold text-gray-900">채팅</h1>
      </div>

      {matches.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-20">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <MessageSquare size={28} className="text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">아직 대화가 없습니다</p>
          <p className="text-sm text-gray-400 mt-1 text-center leading-relaxed">요양보호사와 매칭되면 채팅이 시작됩니다</p>
          <Link
            href={isGuardian ? "/search/caregiver" : "/search/guardian"}
            className="mt-4 bg-primary-500 text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-primary-600 transition-colors"
          >
            {isGuardian ? "요양보호사 찾기" : "일자리 찾기"}
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 bg-white">
          {matches.map((match: any) => {
            const other = isGuardian ? match.caregiver?.user : match.guardian?.user;
            const lastMessage = match.messages?.[0];
            return (
              <Link key={match.id} href={`/chat/${match.id}`}>
                <div className="flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {other?.profileImage ? (
                      <img src={other.profileImage} alt={other.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-base font-bold text-gray-500">{other?.name?.[0]}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-gray-900">{other?.name}</p>
                      {lastMessage && (
                        <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                          {new Date(lastMessage.createdAt).toLocaleDateString("ko-KR", {
                            month: "short", day: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                    {lastMessage ? (
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{lastMessage.content}</p>
                    ) : (
                      <p className="text-xs text-gray-400 mt-0.5">채팅을 시작해보세요</p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
