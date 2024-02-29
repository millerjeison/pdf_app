import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-tree-view',
  templateUrl: './tree-view.component.html',
  styleUrls: ['./tree-view.component.scss']
})
export class TreeViewComponent {
  @Input() items: TreeItem[] | undefined ; // Inicializa con los datos de muestra
  @Output() itemSelected = new EventEmitter<TreeItem>(); // Emite el ítem seleccionado

  // public items: TreeItem[] = [
  //   // Agrega tus items aquí siguiendo el modelo TreeItem
  // ];

  public toggle(item: TreeItem): void {
    if (item.children) {
      item.expanded = !item.expanded;
    }
  }

  public selectItem(item: TreeItem): void {
    // Lógica para manejar la selección de un ítem
    item.selected = !item.selected;
    this.itemSelected.emit(item); // Emite el evento con el ítem seleccionado

  }
}

export interface TreeItem {
  name: string;
  level: number;
  rute?:string,
  thumbnail?:string,
  children?: TreeItem[];
  expanded?: boolean;
  selected?: boolean;
}

