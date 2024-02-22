import { Injectable } from '@angular/core';
import { ApiCrudService } from '../crud_dinamic/api-crud.service';
import { Folder } from 'src/app/interfaces/folder';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class FolderService {


  constructor(private apiCrudService: ApiCrudService<Folder>) {

  }

  setToken(token: string) {
    this.apiCrudService.setToken(token);
  }

  public getFolders(): Observable<Folder[]> {
    return this.apiCrudService.getItems('folders','get_folders');
  }
  
  public createFolder(folder: Folder): Observable<any> {

    let data = {
      "name": folder.name,
      "description": folder.description ?? ''
    }
    return this.apiCrudService.createItem(data, 'folder','create_folder');

  }
}
