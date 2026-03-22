/** Base donation fields shared across the entire app */
export interface Donation {
  id: string;
  giverName: string;
  amount: number;
  groupName: string;
  donationDate: string;
  notes: string;
  monthKey: string;
  createdAt: any;
}

/** Stat card item rendered by KpiCard */
export interface KpiStat {
  label: string;
  val: string | number;
  subtitle?: string;
}
