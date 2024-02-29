import { Component } from '@angular/core';
import { TreeItem } from './components/tree-view/tree-view.component';
import { ApiService } from 'src/app/services/api.service';
import { FolderService } from 'src/app/services/folder/folder.service';
import { Folder } from 'src/app/interfaces/folder';
import { FileService } from 'src/app/services/file/file.service';
import { Router } from '@angular/router';
import { PdfThumbnailService } from 'src/app/services/pdf-thumbnail/pdf-thumbnail.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  foldersAndFile: TreeItem[] = [

    // { name: 'Archivo 3', level: 1, selected: false }
  ];
  childrens: TreeItem[] = [];
  newFolder: boolean = false;
nameFolder:string='';
  folder: Folder = {
    name: "",
    description: ""
  }
  private token: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyLCJleHAiOjE3MDg1MDk3OTQsImlhdCI6MTcwODQyMzM5NH0.hBaoTGyEVjwT6ywN_te_czLi2vLbDK2-Cryn2DDZC54';
  folders: Folder[] = [];
  constructor(private pdfThumbnailService: PdfThumbnailService, private router: Router, private apiService: ApiService, private folderService: FolderService, private fileService: FileService) {
    this.loadData();

  }

  private async loadData() {
    try {
      this.token = await this.apiService.getToken();
      this.folderService.setToken(this.token);
      this.fileService.setToken(this.token);
      // this.createFolder();
      this.loadFolders();
    } catch (error) {
      console.error('Error al obtener el token:', error);
    }
  }

  // Método para navegar
  goToAbout() {
    // Utiliza el método navigate para cambiar de ruta
    this.router.navigate(['/edit-document'] );
  }

  createFolder() {


    if (this.folder.name.trim().length == 0) {
      this.folder.name = "New Folder"
    }
    this.folderService.createFolder(this.folder).subscribe(data => {
      this.foldersAndFile = []
      this.loadFolders();
      this.fusionNewFolder()

    })
  }


  fusionNewFolder() {


    this.newFolder = !this.newFolder;
  }
  private async loadFolders() {

    this.folderService.getFolders().subscribe(folders => {
      let level: number = 1;
      let levelFile: number = 1;
      for (const folder of folders) {
        let treeItem: TreeItem | undefined;
        levelFile = 1;
        this.fileService.getFilesByFolder(folder.id!).subscribe(async data => {
          let fileItems: TreeItem[] | undefined;
          if (data.length > 0) {
            fileItems = []
            for (const file of data) {


              fileItems.push({
                name: file.name,
                level: levelFile,
                rute: file.rute,
                thumbnail: file.thumbnail!
              })
              // levelFile++;
            }
          }
          treeItem = {
            name: folder.name,
            expanded: false,
            selected: false,
            level: level,
            children: fileItems
          }
          // level++
          if (treeItem !== undefined) {
            this.foldersAndFile.push(treeItem);
          }
        })
      }
      this.folders = folders;
    })
  }
  // En tu archivo parent-component.component.ts
  async loadThumbnail(pdfUrl: string) {
    return await this.pdfThumbnailService.getThumbnail(pdfUrl);
  }
  public onItemSelected(item: TreeItem): void {
   this.nameFolder= item.name;
    this.childrens = item.children!
  }
public goToHome(){
let origin=window.location.origin;
  window.location.href=`${origin}/web#home`

}

  edit(item: TreeItem) {
    this.router.navigate(['/edit-document'], { queryParams: { 'rute_file': this.getTextAfterAddons(item.rute!),'name_folder':this.nameFolder } });
  }

  private getTextAfterAddons(fullPath: string): string | null {
    const keyword = 'vizum_pdf';
    const parts = fullPath.split(keyword);

    if (parts.length > 1) {
      let path= parts[1].startsWith('/') ? parts[1].substring(1) : parts[1];
console.log('path nuevas rutas',path);

      return `/vizum_pdf/${path}`
    } else {
      return null;
    }
  }
}
