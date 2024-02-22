import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-tree-view',
  templateUrl: './tree-view.component.html',
  styleUrls: ['./tree-view.component.scss']
})
export class TreeViewComponent {
  @Input() items: TreeItem[] | undefined ; // Inicializa con los datos de muestra

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
  }
}

export interface TreeItem {
  name: string;
  level: number;
  rute?:string,
  children?: TreeItem[];
  expanded?: boolean;
  selected?: boolean;
}

