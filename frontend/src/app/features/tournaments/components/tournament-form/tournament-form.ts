import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tournament-form',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './tournament-form.html',
  styleUrl: './tournament-form.css'
})
export class TournamentFormComponent {
  name: string = '';
  showError: boolean = false;

  @Output() save = new EventEmitter<{ name: string }>();
  @Output() cancel = new EventEmitter<void>();

  onSave(): void {
    if (!this.name.trim()) {
      this.showError = true;
      return;
    }
    this.save.emit({ name: this.name });
    this.name = '';
  }

  onCancel(): void {
    this.name = '';
    this.showError = false;
    this.cancel.emit();
  }
}
