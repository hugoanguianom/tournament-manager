// tournament structure
// id, name, status and created_at
// status can be DRAFT, GENERATED or FINISHED
export type TournamentStatus = 'DRAFT' | 'GENERATED' | 'FINISHED';
export interface Tournament {
  id: number;
  name: string;
  status: TournamentStatus;
  created_at: string;
}


