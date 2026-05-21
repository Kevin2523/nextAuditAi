export interface FleetHostSummary {
  id: number;
  displayName: string;
  hostname: string;
  platform: string;
  osVersion: string;
  status: 'online' | 'offline' | string;
  criticalVulnerabilities: number;
}
