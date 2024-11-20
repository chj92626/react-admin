import React from "react";

// 定义 Route 类型
export interface RouteType {
  path: string;
  name: string;
  icon?: React.ReactNode; // 图标可能是 React 组件
  redirect?: string; // 重定向路径
  children?: RouteType[]; // 子路由
  hide?: boolean; // 是否隐藏
}
