import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditPdfComponent } from './pages/edit-pdf/edit-pdf.component';
import { HomeComponent } from './pages/home/home.component';

const routes: Routes = [
  {path: 'edit-document', component:EditPdfComponent},
  {path: '', component:HomeComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
