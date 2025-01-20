import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ClientService } from '../../services/Clientes/get-clients.service';
import { ProductsService } from '../../services/Products/products.service';
import { InvoiceService } from '../../services/Invoice/invoice.service';


interface Cliente {
  id: number;
  razonSocial: string;
  idTipoCliente: number;
  fechaCreacion: string;
  rfc: string;
}

interface Producto {
  id: number;
  nombreProducto: string;
  imagenProducto: File;
  precioUnitario: number;
  rfc: string;
}

@Component({
  selector: 'app-invoice',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss']
})
export class InvoiceComponent {
  // Formulario principal
  invoiceForm = new FormGroup({
    client: new FormControl('', Validators.required),
    invoiceNumber: new FormControl('', Validators.required),
    products: new FormArray([]),
  });

  
  clients: Cliente[] = [];
  products: Producto[] = [];
  taxRate = 0.19; 
  subtotal = 0;
  total = 0;
  message = "";
  errorMessage = "";

  constructor(private clientService: ClientService, private producService: ProductsService, private invoiceService: InvoiceService) {}

  ngOnInit() {
    this.clientService.getClients().subscribe((clients: any[]) => {
      console.log('Datos recibidos de la API:', clients); 
      this.clients = clients;
      console.log('Clientes mapeados:', clients); 
    });

    this.producService.getProducts().subscribe((products: any[]) => {
      console.log('Datos recibidos de la API:', products); 
      this.products = products;
      console.log('Productos mapeados:', products);
    });
  }

  get productsArray(): FormArray {
    return this.invoiceForm.get('products') as FormArray;
  }

  // Agregar un nuevo producto
  addProduct() {
    const productsArray = this.invoiceForm.get('products') as FormArray;
    const productGroup = new FormGroup({
      productName: new FormControl('', Validators.required),
      unitPrice: new FormControl(0, Validators.required),
      quantity: new FormControl(0, [Validators.required, Validators.min(1)]),
      total: new FormControl(0),
      image: new FormControl(null), 
    });
  
    productsArray.push(productGroup);
  }

  onProductChange(event: Event, index: number) {
    const selectedProductName = (event.target as HTMLSelectElement).value;
    const selectedProduct = this.products.find(product => product.nombreProducto === selectedProductName);
  
    if (selectedProduct) {
      const productFormGroup = this.productsArray.at(index); 
      productFormGroup.get('unitPrice')?.setValue(selectedProduct.precioUnitario);
      productFormGroup.get('image')?.setValue(selectedProduct.imagenProducto);  
    }
  }

  // Calcular totales
  calculateTotals() {
    const productsArray = this.invoiceForm.get('products') as FormArray;
    this.subtotal = productsArray.controls.reduce((acc, product) => {
      const unitPrice = product.get('unitPrice')?.value || 0;
      const quantity = product.get('quantity')?.value || 0;
      const total = unitPrice * quantity;
      product.get('total')?.setValue(total);
      return acc + total;
    }, 0);
  
    const tax = this.subtotal * this.taxRate;
    this.total = this.subtotal + tax;
  }

  // Guardar la factura
  saveInvoice() {

    if (this.productsArray.length == 0) {
      this.errorMessage = "Debes agregar al menos un producto";
      return;
    }
    const invoice = this.invoiceForm.value;
  
    // Crear el objeto de la solicitud
    const invoiceRequest = {
      invoice: {
        FechaEmisionFactura: new Date().toISOString(), 
        NombreCliente: invoice.client, 
        NumeroFactura: invoice.invoiceNumber, 
        NumeroTotalArticulos: invoice.products?.length, 
        SubtotalFactura: this.subtotal,
        TotalImpuestos: this.subtotal * this.taxRate,
        TotalFactura: this.total
      },
      invoiceDetails: invoice.products?.map((product: any) => ({
        NombreProducto: product.productName,
        CantidadDelProducto: product.quantity,
        PrecioUnitarioDelProducto: product.unitPrice,
        SubtotalProducto: product.total,
        Notas: "" 
      }))
    };
  
    // Llamar al servicio para guardar la factura
    this.invoiceService.saveInvoice(invoiceRequest).subscribe(response => {
      this.message = response.message;
      this.errorMessage = "";
    }, error => {
      console.error('Error al guardar la factura:', error);
      this.errorMessage = "Error al guardar la factura, verifica los datos. Los Numeros de Factura deben ser unicos";
      this.message = "";
    });
  }

  resetForm() {
    this.invoiceForm.reset();

    // Vaciar el FormArray si hay productos añadidos
    while (this.productsArray.length) {
      this.productsArray.removeAt(0);
    }

    this.subtotal = 0;
    this.total = 0;
  }

}
