import React from "react";
import LayOuts from "../layouts/index";
import Login from "../pages/login";
import Overview from "../pages/Overview";
import Stats from "../pages/Stats/index";
const routes = [
  {
    path: "/",
    name: "Login",
    component: <Login></Login>, // 登录页面
    hide: true,
  },
  {
    path: "/",
    name: "Home",
    children: [
      {
        path: "/dashboard",
        name: "Dashboard",
        redirect: "/dashboard/overview", // 添加重定向字段
        component: <>Dashboard</>, // Dashboard 页面
        layout: <LayOuts />,
        icon: "🏠",
        hide: false,
        children: [
          {
            path: "/dashboard/overview",
            name: "Overview",
            component: <Overview></Overview>, // 子页面
            hide: false,
          },
          {
            path: "/dashboard/stats",
            name: "Stats",
            component: <Stats></Stats>, // 子页面
            hide: false,
          },
        ],
      },
      {
        path: "/settings",
        name: "Settings",
        redirect: "/settings/profile", // 添加重定向字段
        layout: <LayOuts />,
        component: <>Settings</>, // Settings 页面
        icon: "⚙️",
        hide: false,
        children: [
          {
            path: "/settings/profile",
            name: "Profile",
            component: <>Profile</>, // 子页面
            hide: false,
          },
          {
            path: "/settings/security",
            name: "Security",
            component: <>Security</>, // 子页面
            hide: false,
          },
        ],
      },
    ],
  },
];

export default routes;
