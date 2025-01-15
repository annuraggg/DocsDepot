export interface MonthlyContribution {
    internal?: number;
    external?: number;
    events?: number;
  }
  
  export interface YearlyContribution {
    [month: string]: MonthlyContribution;
  }
  
  export interface MemberContributions {
    [year: string]: YearlyContribution;
  }
  
  export interface Member {
    contr: MemberContributions;
    totalPoints: number;
    fname: string;
    lname: string;
    mid: string;
  }
  
  export interface House {
    id: string;
    name: string;
    color: string;
    abstract: string;
    desc: string;
    logo: string;
    banner: string;
    points: {
      [year: string]: {
        [month: string]: MonthlyContribution;
      };
    };
    members: string[];
  }