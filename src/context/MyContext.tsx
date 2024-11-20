import React, { createContext, useState } from "react";

interface MyContextType {
  value: string;
  setValue: React.Dispatch<React.SetStateAction<any>>;
  chatStatus: boolean;
  setChatStatus: React.Dispatch<React.SetStateAction<any>>;
  theme: string;
  toggleTheme: React.Dispatch<React.SetStateAction<any>>;
}
// 创建 Context
export const MyContext = createContext<MyContextType>({} as MyContextType);
// 创建 Context Provider 组件
export const MyProvider = ({ children }: { children: React.ReactNode }) => {
  const [value, setValue] = useState("初始值");
  const [theme, toggleTheme] = useState<string>("light"); // 主题状态
  const [chatStatus, setChatStatus] =
    useState<MyContextType["chatStatus"]>(true);

  return (
    <MyContext.Provider
      value={{ value, setValue, theme, toggleTheme, chatStatus, setChatStatus }}
    >
      {children}
    </MyContext.Provider>
  );
};
