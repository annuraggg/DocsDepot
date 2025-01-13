// types/dashboard.ts

export interface Point {
    internal?: number;
    external?: number;
    events?: number;
  }
  
  export interface YearlyPoints {
    [key: string]: {
      [month: string]: Point;
    };
  }
  
  export interface House {
    _id: string;
    name: string;
    color: string;
    points: YearlyPoints;
  }
  
  export interface Certificate {
    _id: string;
    certificateName: string;
    certificateType: 'internal' | 'external' | 'event';
    issuingOrg: string;
    points: number;
    xp?: number;
    submittedMonth: number;
    submittedYear: number;
    status: string;
  }
  
  export interface User {
    _id: string;
    firstTime: boolean;
    house: string;
  }
  
  export interface DashboardData {
    user: User;
    allHouses: House[];
    userHouse: House;
    certifications: Certificate[];
  }
  
  export interface PointTotals {
    totalInternal: number;
    totalExternal: number;
    totalEvents: number;
  }