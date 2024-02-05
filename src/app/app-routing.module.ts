import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditPdfComponent } from './pages/edit-pdf/edit-pdf.component';

const routes: Routes = [
  {path: '', component:EditPdfComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
