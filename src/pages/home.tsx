import React, { useContext, useState } from "react";
import { MyContext } from "../context/MyContext";
import Button from "../components/ButtonItem";
import ModalInfo from "../components/ModalInfo";
import BottomModal from "../components/BottomModal";
import Popover from "../components/CPopover"; // 假设组件文件名为 MyPopoverComponent.tsx
import html2canvas from "html2canvas";
import "./index.scss";
const MyComponent = () => {
  const { value, setValue } = useContext(MyContext);
  const cards = [
    { id: 1, title: "Card 1" },
    { id: 2, title: "Card 2" },
    { id: 3, title: "Card 3" },
  ];
  const [isModalOpen, setModalOpen] = useState(false);

  const handleOpen = () => setModalOpen(true);
  const handleClose = () => setModalOpen(false);
  const handleCancel = () => {
    console.log("Cancelled");
    setModalOpen(false);
  };
  const handleConfirm = () => {
    console.log("Confirmed");
    setModalOpen(false);
  };

  const handleClick = () => {
    console.log("Button clicked!");
  };
  const MyPopoverComponent: React.FC = () => {
    const [open, setOpen] = useState<boolean>(false);

    const togglePopover = () => {
      setOpen(!open);
    };

    const closePopover = (item: string) => {
      console.log("Clicked item:", item);
      setOpen(false);
    };

    const items = ["Item 1", "Item 2", "Item 3"];

    const content = (
      <div>
        {items.map((item) => (
          <p key={item} onClick={() => closePopover(item)}>
            {item}
          </p>
        ))}
      </div>
    );

    return (
      <Popover
        content={content}
        open={open}
        onClose={togglePopover}
        position='right'
      >
        <div style={{ margin: "0 5px" }}>
          <span>点击我</span>
        </div>
      </Popover>
    );
  };
  // const changeCardId = (id: any) => {
  //   const selectedCard = cards.find((card) => card.id === id);
  //   document.getElementById("cardTitle").textContent = selectedCard.title;
  // };

  // const dropdownMenu = document.getElementById("dropdownMenu");

  // cards.forEach((item) => {
  //   const div = document.createElement("div");
  //   div.textContent = item.title;
  //   div.onclick = () => changeCardId(item.id);
  //   dropdownMenu.appendChild(div);
  // });
  const aaa = () => {
    navigator.mediaDevices.getDisplayMedia({
      video: {
        cursor: 'always' // 可选值: 'always', 'motion', 'never'
      },
      audio: false // 如果需要音频，可以设置为 true
    }).then((stream: MediaStream) => {
      // 处理成功获取的媒体流
      console.log('Stream obtained:', stream);
      // 例如，将流传递给视频元素
      const videoElement = document.querySelector('video');
      if (videoElement) {
        videoElement.srcObject = stream;
      }
    }).catch((error: any) => {
      // 处理错误
      console.error('Error accessing display media:', error);
    });

    // 使用示例
  
  };
  const takeScreenshot = () => {
    html2canvas(document.body).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = imgData;
      link.download = "screenshot.png";
      link.click();
    }).catch((error) => {
      console.error("Error taking screenshot:", error);
    });
  };
  return (
    <div>
      <p>当前值: {value}</p>
      <button onClick={() => setValue("新的值")}>更新值</button>

      <div className='dropdown'>
        <div className='space'>
          <span id='cardTitle'>Select a Card</span>
          <span className='icon'>&#9662;</span>
        </div>
        <div className='dropdown-content' id='dropdownMenu'></div>
      </div>
      <button onClick={handleOpen}>Open Modal</button>
      {/* <ModalInfo
        isOpen={isModalOpen}
        title="My Modal"
        onClose={handleClose}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
      >
        <p>This is the modal body content.</p>
      </ModalInfo> */}

      <button onClick={handleOpen}>Open Bottom Modal</button>
      <BottomModal
        isOpen={isModalOpen}
        title='My Bottom Modal'
        onClose={handleClose}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
      >
        <p>This is the modal body content.</p>
      </BottomModal>
      <Button type='primary' disabled onClick={handleClick}>
        Primary Button
      </Button>
      <Button type='default' disabled onClick={handleClick}>
        Primary Button
      </Button>
      <Button type='dashed' loading>
        Loading Button
      </Button>
      <Button type='link' disabled>
        Disabled Link Button
      </Button>

      <h1>欢迎使用 Popover 示例</h1>
      <MyPopoverComponent />
      <h1 onClick={aaa}>欢迎使用 aaa 示例</h1>
      <button onClick={takeScreenshot}>Take Screenshot</button>
    </div>
  );
};

export default MyComponent;
