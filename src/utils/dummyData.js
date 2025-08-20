import { useState } from "react";

export const dataSource = [
  {
    studyId: "VR46",
    name: "Mike",
    callCodes: "NPI, CFH",
    status: "Assigned",
    mrn: 928312,
    procedure: "CT C-Spine",
    readers: [
      {
        name: "user11",
        img: "/dp-icon.jpg",
        password: "Test@123",
        reader: true,
      },
      {
        name: "user14",
        img: "/dp-icon.jpg",
        password: "Test@123",
        reader: true,
      },
    ],
  },
  {
    studyId: "MM93",
    name: "John",
    callCodes: "NPI, CFH, NSR1",
    status: "Assigned",
    mrn: 393299,
    procedure: "3D Reconstruction",
    readers: [
      {
        name: "user60",
        img: "/dp-icon.jpg",
        password: "Test@123",
        reader: true,
      },
      {
        name: "user30",
        img: "/dp-icon.jpg",
        password: "Test@123",
        reader: true,
      },
    ],
  },
  {
    studyId: "FB20",
    name: "Emma",
    callCodes: "CFH, NSR2",
    status: "Assigned",
    mrn: 823145,
    procedure: "MRI Brain",
    readers: [
      {
        name: "user18",
        img: "/dp-icon.jpg",
        password: "Test@123",
        reader: true,
      },
      {
        name: "user05",
        img: "/dp-icon.jpg",
        password: "Test@123",
        reader: true,
      },
    ],
  },
  {
    studyId: "CS90",
    name: "Liam",
    callCodes: "NPI",
    status: "Assigned",
    mrn: 456732,
    procedure: "X-Ray Chest",
    readers: [
      {
        name: "user04",
        img: "/dp-icon.jpg",
        password: "Test@123",
        reader: true,
      },
      {
        name: "user18",
        img: "/dp-icon.jpg",
        password: "Test@123",
        reader: true,
      },
    ],
  },
  {
    studyId: "PC88",
    name: "Olivia",
    callCodes: "NSR1, NPI",
    status: "Assigned",
    mrn: 657321,
    procedure: "Ultrasound Abdomen",
    readers: [
      {
        name: "user59",
        img: "/dp-icon.jpg",
        password: "Test@123",
        reader: true,
      },
      {
        name: "user45",
        img: "/dp-icon.jpg",
        password: "Test@123",
        reader: true,
      },
    ],
  },
  {
    studyId: "GL20",
    name: "Noah",
    callCodes: "CFH",
    status: "Assigned",
    mrn: 734829,
    procedure: "CT Pelvis",
    readers: [
      {
        name: "user05",
        img: "/dp-icon.jpg",
        password: "Test@123",
        reader: true,
      },
      {
        name: "user56",
        img: "/dp-icon.jpg",
        password: "Test@123",
        reader: true,
      },
    ],
  },
  {
    studyId: "JK66",
    name: "Ava",
    callCodes: "NPI, NSR2",
    status: "Assigned",
    mrn: 882394,
    procedure: "MRI Knee",
    readers: [
      {
        name: "user09",
        img: "/dp-icon.jpg",
        password: "Test@123",
        reader: true,
      },
      {
        name: "user05",
        img: "/dp-icon.jpg",
        password: "Test@123",
        reader: true,
      },
    ],
  },
];

export const FuncDummyData = (row) => {
  const [data, setData] = useState([...dataSource]);
  const functUpdateData = (idx) => {
    const temp = [...data];
    temp[idx] = { ...temp[idx], status: "Completed" };
    setData(temp);
  };
  return { data, functUpdateData };
};
