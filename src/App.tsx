import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { MyProvider } from "./context/MyContext";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import "./i18n/i18n";
import routes from "./route/index";
import { Route as RouteType } from "./utils/type"; // 引入 Route 类型

const App: React.FC = observer(() => {
  const { t, i18n } = useTranslation(); // t 用于翻译，i18n 用于语言设置
  const [theme, setTheme] = useState<string>(
    () => localStorage.getItem("theme") || "light"
  );

  // 切换语言函数，添加类型注解
  const changeLanguage = (language: string): void => {
    i18n.changeLanguage(language);
  };

  // 设置主题切换逻辑
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = (): void => {
    console.log(theme);
    setTheme(theme === "light" ? "dark" : "light");
  };

  // 渲染路由递归函数
  const renderRoutes = (routes: RouteType[]): React.ReactNode => {
    return routes.map((route: RouteType) => {
      const { path, component, layout, children } = route;

      // 如果有子路由，递归渲染
      if (children) {
        return (
          <Route
            path={path}
            element={layout ? React.cloneElement(layout) : component}
            key={path}
          >
            {renderRoutes(children)} {/* 嵌套路由 */}
          </Route>
        );
      }

      // 普通路由
      return <Route path={path} element={component} key={path} />;
    });
  };

  return (
    <div
      style={{
        background: "var(--background-color)",
        color: "var(--text-color)",
        minHeight: "100vh",
      }}
    >
      <MyProvider>
        <Router>
          <div>
            {/* 语言切换按钮 */}
            <button onClick={() => changeLanguage("en")}>English</button>
            <button onClick={() => changeLanguage("zh")}>中文</button>
            {/* 主题切换按钮 */}
            <button onClick={toggleTheme}>{theme === "light" ? "🌞" : "🌙"}</button>
          </div>
          {/* 渲染路由 */}
          <Routes>{renderRoutes(routes)}</Routes>
        </Router>
      </MyProvider>
    </div>
  );
});

export default App;
