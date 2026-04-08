import { Routes } from '@angular/router';
import { BoneList } from './components/bones/bone-list/bone-list';
import { BoneForm } from './components/bones/bone-form/bone-form';
import { LoginComponent } from './components/login/login-form/login-form';
import { authGuard } from './components/login/auth.guard';

export const routes: Routes = [
    {path: 'login', component: LoginComponent},
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    {path: 'bones', component: BoneList, canActivate: [authGuard], title: 'Bones'},
    {path: 'bones/new', component: BoneForm, canActivate: [authGuard], title: 'Incluir Boné'},
];
