import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
  import { FormsModule } from '@angular/forms';
  import { CommonModule } from '@angular/common';
  import { Player } from '../../../models/player.model';

  @Component({
    selector: 'app-player-form',
    standalone: true,
    imports: [FormsModule, CommonModule],
    templateUrl: './player-form.component.html',
    styleUrl: './player-form.component.css'
  })
  export class PlayerFormComponent implements OnInit {

    nick: string = '';
    showError: boolean = false;

    @Input() playerToEdit: Player | null = null;
    @Output() save = new EventEmitter<{ nick: string, id?: number }>();
    @Output() cancel = new EventEmitter<void>();

    ngOnInit(): void {
      if (this.playerToEdit) {
        this.nick = this.playerToEdit.nick;
      }
    }

    get avatarPreview(): string {
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(this.nick || 'default')}`;
    }

    onSave(): void {
      if (!this.nick) {
        this.showError = true;
        return;
      }

      this.showError = false;

      if (this.playerToEdit) {
        this.save.emit({ nick: this.nick, id: this.playerToEdit.id });
      } else {
        this.save.emit({ nick: this.nick });
      }
    }


    onNickChange(): void {
      if (this.nick) {
        this.showError = false;
      }
    }

    onCancel(): void {
      this.cancel.emit();
    }
  }
