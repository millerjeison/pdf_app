import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PdfThumbnailService {

  constructor() {}

  async getThumbnail(pdfUrl: string): Promise<string> {
    const pdf = await (window as any).pdfjsLib.getDocument(pdfUrl).promise;
    const firstPage = await pdf.getPage(1);
    const scale = 0.5; // Ajusta esto según el tamaño de la miniatura deseado
    const viewport = firstPage.getViewport({ scale });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await firstPage.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;

    return canvas.toDataURL();
  }
}