import { Component, ElementRef, ViewChild } from '@angular/core';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, rgb } from 'pdf-lib';

@Component({
  selector: 'app-edit-pdf',
  templateUrl: './edit-pdf.component.html',
  styleUrls: ['./edit-pdf.component.scss']
})
export class EditPdfComponent {


  pdfUrl: string | null = null;
  pdfData: any;
  isDrawingMode = false;
  startDrawX = 0;
  startDrawY = 0;
  endDrawX = 0;
  endDrawY = 0;
  viewport?: pdfjsLib.PageViewport;

  metadata: metaData[] = [];
  inputs: Input[] = [];
  paneInit = 1;
  input: Input | null = null;

  selectedRectangle: Input | null = null;
  selectedInput: HTMLInputElement | null = null;
  selectedInputType = 'text';

  label?: string
  fileName?: string

  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild('pdfCanvas') pdfCanvas!: ElementRef;
  @ViewChild('inputCanvas') drawingCanvas!: ElementRef;
  @ViewChild('containInput') containInput!: ElementRef;
  @ViewChild('thumbnailContainer') thumbnailContainer!: ElementRef;

  private rectangleCounter = 0;
  private inputsData: any[] = [];

  constructor() { }

  selectFile(): void {
    if (!this.pdfUrl) {
      this.fileInput.nativeElement.click();
      return;
    }
    this.addMetadataAndSave()
  }

  async renderPdfThumbnails() {
    this.clearThumbnails();

    const pdfUrl = this.pdfUrl;

    if (!pdfUrl) return;

    const thumbnailContainer: HTMLDivElement = this.thumbnailContainer.nativeElement;

    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    try {
      const pdfDocument = await pdfjsLib.getDocument(pdfUrl).promise;

      for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber++) {
        const page = await pdfDocument.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 0.3 });

        const thumbnailCanvas = document.createElement('canvas');
        thumbnailCanvas.width = viewport.width;
        thumbnailCanvas.height = viewport.height;

        
        const thumbnailContext = thumbnailCanvas.getContext('2d') as CanvasRenderingContext2D;
        const renderContext = {
          canvasContext: thumbnailContext,
          viewport: viewport,
        };
        await page.render(renderContext).promise;
        thumbnailCanvas.addEventListener('click', () => this.showPageInMainCanvas(pageNumber));

        thumbnailContainer.appendChild(thumbnailCanvas);
      }
    } catch (error) {
      console.error('Error al cargar las miniaturas del PDF:', error);
    }
  }

  clearThumbnails() {
    const thumbnailContainer: HTMLDivElement = this.thumbnailContainer.nativeElement;
    while (thumbnailContainer.firstChild) {
      thumbnailContainer.removeChild(thumbnailContainer.firstChild);
    }
  }

  // Método para manejar la selección de un rectángulo
  selectRectangle(rectangle: Input) {
    this.selectedRectangle = rectangle;
    this.selectedInput = null; // Desseleccionar cualquier input seleccionado
  }

  // Método para manejar la selección de un input
  selectInput(input: HTMLInputElement) {
    this.selectedInput = input;
    this.selectedRectangle = null; // Desseleccionar cualquier rectángulo seleccionado
  }

  async showPageInMainCanvas(pageNumber: number) {
    this.selectedRectangle = null;
    this.selectedInput = null;
    this.paneInit = pageNumber;
    this.clearCanvas();
    const pdfUrl = this.pdfUrl;

    if (!pdfUrl) return;

    const canvas: HTMLCanvasElement = this.pdfCanvas.nativeElement;
    const context = canvas.getContext('2d') as CanvasRenderingContext2D;

    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    try {
      const pdfDocument = await pdfjsLib.getDocument(pdfUrl).promise;
      const selectedPage = await pdfDocument.getPage(pageNumber);

      const viewport = selectedPage.getViewport({ scale: 1.5 });
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };
      //inputs
      this.inputs = this.metadata.find(i => i.pageNumber === this.paneInit)?.inputs || [];

      await selectedPage.render(renderContext).promise;
    } catch (error) {
      console.error('Error al mostrar la página en el canvas principal:', error);
    }
  }
  changeCheck(i: Input) {
    i.checked = !i.checked;
  }
  clearCanvas() {
    const canvas: HTMLCanvasElement = this.drawingCanvas.nativeElement;
    const context = canvas.getContext('2d') as CanvasRenderingContext2D;
    context.clearRect(0, 0, canvas.width, canvas.height);
  }
  async onFileSelected(event: any) {
    this.inputs = [];
    const selectedFile = event.target.files[0];

    if (selectedFile && selectedFile.type === 'application/pdf') {
      this.fileName = selectedFile.name;
      console.log('Nombre del archivo:', this.fileName);

      this.pdfUrl = URL.createObjectURL(selectedFile);
      this.renderPdf();
    } else {
      this.pdfUrl = null;
    }
  }
  selectedIn(type: string) {
    if (this.input) {
      this.input.type = type;
      this.label = ''
      // Buscar y actualizar el tipo en this.inputs por ID
      const inputToUpdate = this.inputs.find(i => i.id === this.input!.id);

      if (inputToUpdate) {
        inputToUpdate.type = type;
      }
    }
  }
  async renderPdf() {
    const pdfUrl = this.pdfUrl;

    if (!pdfUrl) return;

    const canvas: HTMLCanvasElement = this.pdfCanvas.nativeElement;
    const context = canvas.getContext('2d') as CanvasRenderingContext2D;
    const canvasdrawingCanvas: HTMLCanvasElement = this.drawingCanvas.nativeElement;

    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    try {
      const pdfDocument = await pdfjsLib.getDocument(pdfUrl).promise;
      const firstPage = await pdfDocument.getPage(1);
      const metadata = await pdfDocument.getMetadata();

      firstPage.getAnnotations().then(annotations => {
        annotations.forEach(annotation => {

          console.log('annotation',annotation);
          
        });

      })


      let Keywords = (metadata.info as any).Keywords;
      // Verificar si 'Keywords' existe y no está vacío
      if (Keywords&&Keywords.length > 0) {
        // Parsear el contenido de 'Keywords' que está en formato string JSON
        const keywordsData = JSON.parse(Keywords);
        for (const i of keywordsData) {
          let meta = this.metaDataFromJson(i);
          const newMetadata: metaData = meta;
          this.metadata.push(newMetadata);
          this.inputs = this.metadata.find(i => i.pageNumber === this.paneInit)?.inputs || [];
        }
      }

      this.viewport = firstPage.getViewport({ scale: 1.5 });
      canvas.width = this.viewport.width;
      canvas.height = this.viewport.height;

      this.containInput.nativeElement.style.width = `${canvas.width}px`;
      this.containInput.nativeElement.style.height = `${canvas.height}px`;
      canvasdrawingCanvas.width = canvas.width;
      canvasdrawingCanvas.height = canvas.height;

      const renderContext = {
        canvasContext: context,
        viewport: this.viewport,
      };
      this.renderPdfThumbnails();

      await firstPage.render(renderContext).promise;
    } catch (error) {
      console.error('Error al cargar el PDF:', error);
    }
  }
  metaDataFromJson(json: any): metaData {
    // Asegúrate de que tu JSON tiene la estructura correcta y que 'inputs' es un array
    if (!json || typeof json.pageNumber !== 'number' || !Array.isArray(json.inputs)) {
      throw new Error('JSON format is invalid for metaData');
    }

    // Aquí podrías llamar a `Input.fromJson` para cada input si `Input` es una clase con ese método estático
    const inputs: Input[] = json.inputs.map((inputJson: any) => Input.fromJson(inputJson));

    // Construye el objeto metaData
    return {
      pageNumber: json.pageNumber,
      inputs: inputs,
    };
  }
  resizeCanvas(width: number, height: number) {
    const canvas: HTMLCanvasElement = this.pdfCanvas.nativeElement;
    const drawingCanvas: HTMLCanvasElement = this.drawingCanvas.nativeElement;

    canvas.width = width;
    canvas.height = height;

    drawingCanvas.width = width;
    drawingCanvas.height = height;
  }

  startDrawing(event: MouseEvent) {
    const canvas = this.drawingCanvas.nativeElement;
    const rect = canvas.getBoundingClientRect();
    this.startDrawX = event.clientX - rect.left;
    this.startDrawY = event.clientY - rect.top;

    this.isDrawingMode = true;
  }

  endDrawing(event: MouseEvent) {
    const canvas = this.drawingCanvas.nativeElement;
    const rect = canvas.getBoundingClientRect();
    this.endDrawX = event.clientX - rect.left;
    this.endDrawY = event.clientY - rect.top;

    const width = this.endDrawX - this.startDrawX;
    const height = this.endDrawY - this.startDrawY;

    this.drawRectangle(this.startDrawX, this.startDrawY, width, height);
    this.addInputToCanvas(this.startDrawX, this.startDrawY, width, height);

    this.isDrawingMode = false;
    this.startDrawX = 0;
    this.startDrawY = 0;
    this.rectangleCounter++;
  }

  drawRectangle(x: number, y: number, width: number, height: number) {
    const canvas = this.drawingCanvas.nativeElement;
    const context = canvas.getContext('2d')!;
    context.strokeStyle = 'red';
    context.lineWidth = 2;
    context.strokeRect(x, y, width, height);
  }

  drawWhileDragging(event: MouseEvent) {
    if (this.isDrawingMode) {
      const canvas = this.drawingCanvas.nativeElement;
      const context = canvas.getContext('2d') as CanvasRenderingContext2D;

      context.clearRect(0, 0, canvas.width, canvas.height);

      const rect = canvas.getBoundingClientRect();
      this.endDrawX = event.clientX - rect.left;
      this.endDrawY = event.clientY - rect.top;

      const width = this.endDrawX - this.startDrawX;
      const height = this.endDrawY - this.startDrawY;

      this.drawRectangle(this.startDrawX, this.startDrawY, width, height);
    }
  }


  clearInputs() {
    const pageNumber = this.paneInit;
    const metadataIndex = this.metadata.findIndex(item => item.pageNumber === pageNumber);

    if (metadataIndex !== -1) {
      this.metadata[metadataIndex].inputs = [];
      this.inputs = [];
    }
  }
  onSelectedInput(input: Input) {
    this.input = input;
    this.label = input.label
  }


  deleteInputById(): void {
    if (this.selectedInput) {
      const idToDelete = this.input!.id;
      const indexToDelete = this.inputs.findIndex(i => i.id === idToDelete);
      if (indexToDelete !== -1) {
        this.inputs.splice(indexToDelete, 1);
      }
      this.selectedInput = null;
    }
  }

  addInputToCanvas(x: number, y: number, width: number, height: number, inputType?: string, pageNumberDefault?: number): void {
    const containInput = document.querySelector('.contain_input');
    if (!containInput) {
      console.error('No se encontró el contenedor con la clase .contain_input');
      return;
    }
    const input = document.createElement('input');
    input.style.position = 'absolute';
    // Ajustar la posición y el tamaño del input dependiendo de la dirección del dibujo
    if (width < 0) {
      input.style.left = `${x + width}px`;
      input.style.width = `${-width}px`;
    } else {
      input.style.left = `${x}px`;
      input.style.width = `${width}px`;
    }

    if (height < 0) {
      input.style.top = `${y + height}px`;
      input.style.height = `${-height}px`;
    } else {
      input.style.top = `${y}px`;
      input.style.height = `${height}px`;
    }

    const rectangleData: Input = {
      id: this.inputs.length + 1,
      x: input.style.left,
      y: input.style.top,
      type: "text",
      checked: false,
      width: input.style.width,
      height: input.style.height,
      inputId: this.rectangleCounter,
    };

    const pageNumber = this.paneInit;
    const metadataIndex = this.metadata.findIndex(item => item.pageNumber === pageNumber);

    if (pageNumberDefault) {
      const newMetadata: metaData = {
        pageNumber: pageNumberDefault,
        inputs: [rectangleData],
      };
    } else {
      if (metadataIndex !== -1) {
        this.metadata[metadataIndex].inputs.push(rectangleData);
      } else {
        const newMetadata: metaData = {
          pageNumber: pageNumber,
          inputs: [rectangleData],
        };

        this.metadata.push(newMetadata);
      }
    }



    this.input = rectangleData;
    this.inputs = this.metadata.find(i => i.pageNumber === this.paneInit)?.inputs || [];
    this.selectRectangle(rectangleData);

    this.selectInput(input);
  }


  changeLabel() {
    this.input!.label = this.label;

  }

  // async addMetadataAndSave(): Promise<void> {
  //   try {
  //     const existingPdfBytes = await fetch(this.pdfUrl!).then((res) => res.arrayBuffer());
  //     const pdfDoc = await PDFDocument.load(existingPdfBytes);
  //     const metadataString = JSON.stringify(this.inputs);
  //     pdfDoc.setTitle(metadataString);
  //     pdfDoc.setSubject('Asunto del PDF');
  //     pdfDoc.setKeywords(['pdf-lib', 'PDFDocument', 'metadata']);
  //     const modifiedPdfBytes = await pdfDoc.save();
  //     const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
  //     const link = document.createElement('a');
  //     link.href = URL.createObjectURL(blob);
  //     link.download = this.fileName + "_vizumapp.pdf";
  //     link.click();
  //   } catch (error) {
  //     console.error('Error al procesar el PDF:', error);
  //   }
  // }

  async addMetadataAndSave(): Promise<void> {
    try {
      const existingPdfBytes = await fetch(this.pdfUrl!).then((res) => res.arrayBuffer());
      const pdfDoc = await PDFDocument.load(existingPdfBytes);

      // Asegúrate de que los metadatos están en el formato correcto, como un string JSON.
      const metadataString = JSON.stringify(this.metadata);

      // Aquí puedes añadir los metadatos como un campo de texto personalizado o como metadatos en el documento.
      // Es importante que no interfieran con la visualización del documento.
      pdfDoc.setTitle(this.fileName + "_modified.pdf");
      pdfDoc.setProducer('Your Application Metadata');
      pdfDoc.setCreator('Your Application Name');
      pdfDoc.setKeywords([metadataString]); // Esto es solo un ejemplo, ajusta según sea necesario.

      const modifiedPdfBytes = await pdfDoc.save();
      const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);

      let newName = this.fileName?.replace('.pdf', '');


      link.download = `${newName}_modified.pdf`;
      link.click();
    } catch (error) {
      console.error('Error al procesar el PDF:', error);
    }
  }
}
interface metaData {
  pageNumber: number;
  inputs: Input[];
}
class Input {
  id: number;
  x: string;
  y: string;
  type: string;
  width: string;
  height: string;
  label?: string;
  checked: boolean;
  inputId: number;

  constructor(
    id: number,
    x: string,
    y: string,
    type: string,
    width: string,
    height: string,
    label: string | undefined,
    checked: boolean,
    inputId: number
  ) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.type = type;
    this.width = width;
    this.height = height;
    this.label = label;
    this.checked = checked;
    this.inputId = inputId;
  }

  // Método estático para crear una instancia de Input desde un objeto JSON
  static fromJson(json: any): Input {
    // Asumiendo que json es un objeto con las propiedades correctas
    // Aquí deberías agregar validaciones o lógica de transformación si es necesario
    return new Input(
      json.id,
      json.x,
      json.y,
      json.type,
      json.width,
      json.height,
      json.label,
      json.checked,
      json.inputId
    );
  }
}
