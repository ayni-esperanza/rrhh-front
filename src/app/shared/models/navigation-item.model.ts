import { FlowbiteIconName } from '../icons/flowbite-icons';

export interface NavigationItem {
  label: string;
  route: string;
  icon: FlowbiteIconName;
  permission?: string;
}