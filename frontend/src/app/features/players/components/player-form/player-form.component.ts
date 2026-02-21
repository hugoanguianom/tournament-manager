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
    // show error if nick is empty
    showError: boolean = false;

    // get data from parent page
    // input : get data
    // output : send data

    // if you want to edit a player, you will receive the player data
    // if you want to create a new player, you will receive null
    @Input() playerToEdit: Player | null = null;

    //send data to parent page save or cancel
    @Output() save = new EventEmitter<{ nick: string, id?: number }>();
    @Output() cancel = new EventEmitter<void>();

    // if we recieve a player we fill th form with the player nick
    ngOnInit(): void {
      if (this.playerToEdit) {
        this.nick = this.playerToEdit.nick;
      }
    }

    // dice bear to generate an avatar based on the nick
    // if there is no nick we generate a default avatar
    get avatarPreview(): string {
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(this.nick || 'default')}`;
    }


    // if the form is not valid we show an error
    onSave(): void {
      if (!this.nick) {
        this.showError = true;
        return;
      }

      this.showError = false;

      //
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
