import { Routes } from '@angular/router';
import { BoneList } from './components/bones/bone-list/bone-list';
import { BoneForm } from './components/bones/bone-form/bone-form';
import { LoginComponent } from './components/login/login-form/login-form';
import { authGuard } from './components/login/auth.guard';
import { MarcaList } from './components/marcas/marca-list/marca-list';
import { MaterialList } from './components/materiais/material-list/material-list';
import { ModeloList } from './components/modelos/modelo-list/modelo-list';
import { EstoqueList } from './components/estoques/estoque-list/estoque-list';
import { EstampaList } from './components/estampas/estampa-list/estampa-list';

export const routes: Routes = [
    {path: 'login', component: LoginComponent},
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    {path: 'bones', component: BoneList, canActivate: [authGuard], title: 'Bones'},
    {path: 'bones/new', component: BoneForm, canActivate: [authGuard], title: 'Incluir Boné'},
    {path: 'marcas', component: MarcaList, canActivate: [authGuard], title: 'Marcas'},
    {path: 'materiais', component: MaterialList, canActivate: [authGuard], title: 'Materiais'},
    {path: 'modelos', component: ModeloList, canActivate: [authGuard], title: 'Modelos'},
    {path: 'estoques', component: EstoqueList, canActivate: [authGuard], title: 'Estoques'},
    {path: 'estampas', component: EstampaList, canActivate: [authGuard], title: 'Estampas'}

];
