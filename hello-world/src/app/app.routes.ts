import { Routes } from '@angular/router';
import { BoneList } from './components/bones/bone-list/bone-list';
import { BoneForm } from './components/bones/bone-form/bone-form';
import { BoneMenu } from './components/bones/bone-menu/bone-menu';
import { LoginComponent } from './components/login/login-form/login-form';
import { RegisterComponent } from './components/login/register-form/register-form';
import { ForgotPasswordComponent } from './components/login/forgot-password/forgot-password';
import { ResetPasswordComponent } from './components/login/reset-password/reset-password';
import { VerifyEmailComponent } from './components/login/verify-email/verify-email';
import { authGuard } from './components/login/auth.guard';
import { MarcaList } from './components/marcas/marca-list/marca-list';
import { MarcaForm } from './components/marcas/marca-form/marca-form';
import { MaterialList } from './components/materiais/material-list/material-list';
import { MaterialForm } from './components/materiais/material-form/material-form';
import { ModeloList } from './components/modelos/modelo-list/modelo-list';
import { ModeloForm } from './components/modelos/modelo-form/modelo-form';
import { EstoqueList } from './components/estoques/estoque-list/estoque-list';
import { EstampaList } from './components/estampas/estampa-list/estampa-list';
import { EstampaForm } from './components/estampas/estampa-form/estampa-form';
import { BoneEdit } from './components/bones/bone-edit/bone-edit';

export const routes: Routes = [
    {path: 'login', component: LoginComponent},
    {path: 'register', component: RegisterComponent},
    {path: 'forgot-password', component: ForgotPasswordComponent},
    {path: 'reset-password', component: ResetPasswordComponent},
    {path: 'verify-email', component: VerifyEmailComponent},
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    {path: 'menu', component: BoneMenu, canActivate: [authGuard], title: 'Catálogo de Bonés'},
    {path: 'bones', component: BoneList, canActivate: [authGuard], title: 'Bones'},
    {path: 'bones/new', component: BoneForm, canActivate: [authGuard], title: 'Incluir Boné'},
    { path: 'bones/edit/:id', component: BoneEdit, canActivate: [authGuard], title: 'Editar Bone' },
    {path: 'marcas', component: MarcaList, canActivate: [authGuard], title: 'Marcas'},
    {path: 'marcas/new', component: MarcaForm, canActivate: [authGuard], title: 'Nova Marca'},
    {path: 'marcas/edit/:id', component: MarcaForm, canActivate: [authGuard], title: 'Editar Marca'},
    {path: 'materiais', component: MaterialList, canActivate: [authGuard], title: 'Materiais'},
    {path: 'materiais/new', component: MaterialForm, canActivate: [authGuard], title: 'Novo Material'},
    {path: 'materiais/edit/:id', component: MaterialForm, canActivate: [authGuard], title: 'Editar Material'},
    {path: 'modelos', component: ModeloList, canActivate: [authGuard], title: 'Modelos'},
    {path: 'modelos/new', component: ModeloForm, canActivate: [authGuard], title: 'Novo Modelo'},
    {path: 'modelos/edit/:id', component: ModeloForm, canActivate: [authGuard], title: 'Editar Modelo'},
    {path: 'estoques', component: EstoqueList, canActivate: [authGuard], title: 'Estoques'},
    {path: 'estampas', component: EstampaList, canActivate: [authGuard], title: 'Estampas'}
    ,{path: 'estampas/new', component: EstampaForm, canActivate: [authGuard], title: 'Nova Estampa'}
    ,{path: 'estampas/edit/:id', component: EstampaForm, canActivate: [authGuard], title: 'Editar Estampa'}

];
