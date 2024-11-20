import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../../i18n/i18n";
const Login = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  // 登录逻辑示例
  const handleLogin = () => {
    // 登录成功后跳转到首页
    navigate("/dashboard");
  };
  return <div onClick={handleLogin}>登录 {t("welcome")}</div>;
};

export default Login;
