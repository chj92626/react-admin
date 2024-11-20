import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import routes from "../route/index";
import { RouteType } from "../utils/type";

const LayOuts: React.FC = () => {
  const location = useLocation();

  // 获取实际路径，处理重定向
  const getActualPath = (route: RouteType): string => {
    return route.redirect || route.path;
  };

  // 判断当前路径是否匹配菜单或其子菜单
  const isRouteSelected = (route: RouteType): boolean => {
    const actualPath = getActualPath(route);
    if (location.pathname.startsWith(actualPath)) {
      return true;
    }
    if (route.children) {
      return route.children.some((child: RouteType) =>
        isRouteSelected(child)
      );
    }
    return false;
  };

  // 递归渲染菜单
  const renderMenu = (routes: RouteType[]): React.ReactNode => {
    return routes
      .filter((route) => !route.hide) // 过滤掉隐藏的路由
      .map((route) => {
        const isSelected = isRouteSelected(route); // 判断是否选中
        const hasChildren = route.children && route.children.length > 0; // 是否有子菜单

        return (
          <div
            key={route.path}
            style={{ marginBottom: "10px", borderRadius: "4px" }}
          >
            <Link
              to={getActualPath(route)} // 跳转路径
              style={{
                textDecoration: "none",
                color: isSelected ? "#00796b" : "var(--text-color)", // 高亮选中时文字颜色
                background:
                  !hasChildren && isSelected ? "#e0f7fa" : "transparent", // 子菜单背景高亮，父菜单无背景
                display: "block",
                padding: "5px 10px",
              }}
            >
              {route.icon} {route.name}
            </Link>
            {hasChildren && (
              <ul
                style={{
                  marginLeft: "20px",
                  listStyle: "none",
                  padding: 0,
                }}
              >
                {renderMenu(route.children)} {/* 递归渲染子菜单 */}
              </ul>
            )}
          </div>
        );
      });
  };

  return (
    <div style={{ display: "flex" }}>
      {/* 侧边栏 */}
      <div
        style={{
          width: "230px",
          background: 'var(--background-color)',
          padding: "20px",
          overflowY: "auto", // 滚动条
          height: "100vh", // 全屏高度
          boxSizing: "border-box",
        }}
      >
        {renderMenu((routes[1].children || []) as RouteType[])}{" "}
        {/* 渲染主菜单 */}
      </div>

      {/* 内容区域 */}
      <div style={{ flex: 1, padding: "20px" }}>
        <Outlet /> {/* 渲染子页面 */}
      </div>
    </div>
  );
};

export default LayOuts;
