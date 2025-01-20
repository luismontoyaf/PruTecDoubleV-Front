import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ClientService } from '../../services/Clientes/get-clients.service';
import { InvoiceService } from '../../services/Invoice/invoice.service'; 

interface Cliente {
  id: number;
  razonSocial: string;
  idTipoCliente: number;
  fechaCreacion: string;
  rfc: string;
}

@Component({
  selector: 'app-search',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent implements OnInit {

  clients: Cliente[] = [];
  facturas: any[] = [];
  searchForm: FormGroup;
  message ="";

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private invoiceService: InvoiceService 
  ) {
    this.searchForm = this.fb.group({
      searchType: ['cliente'],
      cliente: [''], 
      numeroFactura: [''] 
    });
  }

  ngOnInit(): void {
    // Inicializar los clientes primero
    this.clientService.getClients().subscribe((clients: any[]) => {
      console.log('Datos recibidos de la API:', clients); 
      this.clients = clients;
    });
  
    
  this.searchForm.valueChanges.subscribe((value) => {
    console.log('Formulario completo:', value);
  });

  // Observa específicamente los cambios en el radio button 'searchType'
  this.searchForm.get('searchType')?.valueChanges.subscribe((value) => {
    console.log('Tipo de búsqueda seleccionado:', value);
    this.handleSearchTypeChange(value); // Ejecuta la función cada vez que cambia el radio button
  });
  
  // Ejecutar lógica de habilitar/deshabilitar campos al inicio
  this.handleSearchTypeChange(this.searchForm.get('searchType')?.value);
  }
  
  handleSearchTypeChange(value: string): void {
    if (value === 'cliente') {
      this.searchForm.get('numeroFactura')?.disable();
      this.searchForm.get('numeroFactura')?.setValue('');
      this.searchForm.get('cliente')?.enable();
    } else if (value === 'numeroFactura') {
      // Cuando se selecciona "Número de Factura", deshabilitar cliente y limpiar su valor
      this.searchForm.get('cliente')?.disable();
      this.searchForm.get('cliente')?.setValue('');
      this.searchForm.get('numeroFactura')?.enable();
    }
  }

  buscar(): void {
    const { cliente, numeroFactura } = this.searchForm.value;
  
    if (!cliente && !numeroFactura) {
      this.message = "Debe proporcionar al menos un valor: Cliente o Número de Factura";
      return;
    }
  
    const searchParams = {
      Client: cliente || null, 
      NumeroFactura: numeroFactura || null 
    };
  
    console.log("Cliente o Factura", searchParams);
  
    this.invoiceService.searchInvoice(searchParams).subscribe(
      (facturas) => {
        console.log('Facturas obtenidas:', facturas);
        this.facturas = facturas;
      },
      (error) => {
        console.error('Error al buscar facturas:', error);
      }
    );
  }
}
