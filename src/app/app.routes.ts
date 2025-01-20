import { Routes } from '@angular/router';
import { InvoiceComponent } from './components/invoice/invoice.component';
import { SearchComponent } from './components/search/search.component';

export const routes: Routes = [
    {path: '', component: InvoiceComponent},
    {path: 'search', component: SearchComponent}
];