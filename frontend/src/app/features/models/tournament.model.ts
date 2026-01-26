export type TournamentStatus = 'DRAFT' | 'GENERATED' | 'FINISHED';

export interface Tournament {
  id: number;
  name: string;
  status: TournamentStatus;
  created_at: string;
}

export interface TournamentCreate {
  name: string;
}
