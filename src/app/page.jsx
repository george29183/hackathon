"use client";

import React, { useState } from "react";
import { AppStateProvider, useAppState } from "./context/AppStateContext";
import LoginCard from "./auth/LoginCard";
import Lobby from "./student/Lobby";
import QuizEngine from "./student/QuizEngine";
import Results from "./student/Results";
import Dashboard from "./admin/Dashboard";
import { Button } from "./components/Button";
import { Badge } from "./components/Badge";

// 路由网关核心渲染分发器
function MainAppGateway() {
  const { currentUser, logout } = useAppState();

  // 学生端内部子视图导航状态机：'LOBBY' | 'QUIZ' | 'RESULTS'
  const [studentView, setStudentView] = useState("LOBBY");
  const [activeRoom, setActiveRoom] = useState(null);
  const [currentTelemetryData, setCurrentTelemetryData] = useState({});

  // 1. 未登录状态下，强行拦截并置入鉴权闸口
  if (!currentUser) {
    return <LoginCard />;
  }

  // 2. 仿真教师（ADMIN）视图路由分支
  if (currentUser.role === "ADMIN") {
    return (
      <div className="min-h-screen flex flex-col">
        {/* 全局管理端顶部通栏 */}
        <header className="bg-white border-b-4 border-[#1E1E1E] px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 z-10">
          <div className="flex items-center gap-3">
            <div className="font-['Space_Grotesk'] font-bold text-xl uppercase tracking-tighter bg-[#FF6B6B] border-2 border-[#1E1E1E] p-1.5 shadow-[2px_2px_0px_0px_#1E1E1E]">
              ⚡ POP
            </div>
            <div>
              <span className="font-['Space_Grotesk'] text-xs font-bold tracking-widest text-[#1E1E1E]/50 block">CONSOLE</span>
              <h2 className="font-['Plus_Jakarta_Sans'] font-bold text-sm">北欧波普遥测大屏</h2>
            </div>
          </div>
          <div className="flex items-center gap-4 font-['Plus_Jakarta_Sans']">
            <div className="text-right hidden sm:block">
              <span className="text-xs font-bold text-[#1E1E1E]/40 block">当前讲师</span>
              <span className="text-sm font-bold">{currentUser.name}</span>
            </div>
            <Button variant="danger" onClick={logout} className="px-4 py-1.5 text-xs border-2 shadow-[2px_2px_0px_0px_#1E1E1E]">
              登出控制台 🔓
            </Button>
          </div>
        </header>

        {/* 教师主看板挂载 */}
        <main className="flex-1 bg-[#F4F4F2]">
          <Dashboard />
        </main>
      </div>
    );
  }

  // 3. 仿真学生（STUDENT）视图路由分支
  return (
    <div className="min-h-screen flex flex-col">
      {/* 全局学生端顶部通栏 */}
      <header className="bg-white border-b-4 border-[#1E1E1E] px-6 py-4 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="font-['Space_Grotesk'] font-bold text-xl uppercase tracking-tighter bg-[#0055FF] text-white border-2 border-[#1E1E1E] p-1.5 shadow-[2px_2px_0px_0px_#1E1E1E]">
            🧠 RM
          </div>
          <div>
            <span className="font-['Space_Grotesk'] text-xs font-bold tracking-widest text-[#1E1E1E]/50 block">STUDENT HUB</span>
            <h2 className="font-['Plus_Jakarta_Sans'] font-bold text-sm">认知测验大厅</h2>
          </div>
        </div>
        <div className="flex items-center gap-4 font-['Plus_Jakarta_Sans']">
          <div className="text-right hidden sm:block">
            <span className="text-xs font-bold text-[#1E1E1E]/40 block">仿真学生账户</span>
            <span className="text-sm font-bold">{currentUser.name}</span>
          </div>
          <Button variant="secondary" onClick={logout} className="px-4 py-1.5 text-xs border-2 shadow-[2px_2px_0px_0px_#1E1E1E]">
            注销 🔓
          </Button>
        </div>
      </header>

      {/* 学生内部子视图高精密生命周期状态机 */}
      <main className="flex-1 bg-[#F4F4F2] py-6">
        {studentView === "LOBBY" && (
          <Lobby
            onRoomVerified={(room) => {
              setActiveRoom(room);
              setStudentView("QUIZ");
            }}
          />
        )}

        {studentView === "QUIZ" && (
          <QuizEngine
            room={activeRoom}
            onFinishWithData={(telemetry) => {
              setCurrentTelemetryData(telemetry);
              setStudentView("RESULTS");
            }}
          />
        )}

        {studentView === "RESULTS" && (
          <Results
            room={activeRoom}
            telemetryData={currentTelemetryData}
            onFinish={() => {
              // 重置学生端，使其回到准备大厅可以重新输入房间
              setActiveRoom(null);
              setCurrentTelemetryData({});
              setStudentView("LOBBY");
            }}
          />
        )}
      </main>
    </div>
  );
}

// 根入口包裹全局 AppState 状态中枢上下文
export default function App() {
  return (
    <AppStateProvider>
      <MainAppGateway />
    </AppStateProvider>
  );
}