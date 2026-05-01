export interface StatItem {
  value: string;
  label: string;
  iconName: string;
  iconColor: string;
  iconBg: string;
}

export interface ActionItem {
  label: string;
  iconName: string;
  active?: boolean;
  route: string;
}
