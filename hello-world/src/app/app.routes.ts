import { Routes } from '@angular/router';
import { BoneList } from './components/bones/bone-list/bone-list';
import { BoneForm } from './components/bones/bone-form/bone-form';
import { BoneMenu } from './components/bones/bone-menu/bone-menu';
import { BoneEdit } from './components/bones/bone-edit/bone-edit';
import { BoneDetail } from './components/bones/bone-detail/bone-detail';
import { LoginComponent } from './components/login/login-form/login-form';
import { RegisterComponent } from './components/login/register-form/register-form';
import { ForgotPasswordComponent } from './components/login/forgot-password/forgot-password';
import { ResetPasswordComponent } from './components/login/reset-password/reset-password';
import { VerifyEmailComponent } from './components/login/verify-email/verify-email';
import { WishlistList } from './components/wishlist/wishlist-list/wishlist-list';
import { CartPage } from './components/cart/cart-page/cart-page';
import { CouponAdmin } from './components/coupons/coupon-admin/coupon-admin';
import { CheckoutPage } from './components/checkout/checkout-page/checkout-page';
import { PurchaseSummary } from './components/checkout/purchase-summary/purchase-summary';
import { UsuarioAdmin } from './components/usuarios/usuario-admin/usuario-admin';
import { UsuarioForm } from './components/usuarios/usuario-form/usuario-form';
import { UserProfile } from './components/usuarios/user-profile/user-profile';
import { authGuard } from './components/login/auth.guard';
import { adminGuard } from './components/login/admin.guard';
import { MarcaList } from './components/marcas/marca-list/marca-list';
import { MarcaForm } from './components/marcas/marca-form/marca-form';
import { MaterialList } from './components/materiais/material-list/material-list';
import { MaterialForm } from './components/materiais/material-form/material-form';
import { ModeloList } from './components/modelos/modelo-list/modelo-list';
import { ModeloForm } from './components/modelos/modelo-form/modelo-form';
import { EstoqueList } from './components/estoques/estoque-list/estoque-list';
import { EstampaList } from './components/estampas/estampa-list/estampa-list';
import { EstampaForm } from './components/estampas/estampa-form/estampa-form';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'verify-email', component: VerifyEmailComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'menu', component: BoneMenu, canActivate: [authGuard], title: 'Catalogo de Bones' },
  { path: 'bones', component: BoneList, canActivate: [authGuard, adminGuard], title: 'Bones' },
  { path: 'bones/new', component: BoneForm, canActivate: [authGuard,  adminGuard], title: 'Incluir Bone' },
  { path: 'bones/edit/:id', component: BoneEdit, canActivate: [authGuard,   adminGuard], title: 'Editar Bone' },
  { path: 'produto/:id', component: BoneDetail, canActivate: [authGuard], title: 'Detalhe do Produto' },
  { path: 'wishlist', component: WishlistList, canActivate: [authGuard], title: 'Lista de Desejos' },
  { path: 'carrinho', component: CartPage, canActivate: [authGuard], title: 'Carrinho de Compras' },
  { path: 'finalizar-compra', component: CheckoutPage, canActivate: [authGuard], title: 'Finalizar Compra' },
  { path: 'resumo-compra/:id', component: PurchaseSummary, canActivate: [authGuard], title: 'Resumo da Compra' },
  { path: 'cupons', component: CouponAdmin, canActivate: [authGuard, adminGuard], title: 'Cupons' },
  { path: 'usuarios', component: UsuarioAdmin, canActivate: [authGuard, adminGuard], title: 'Usuarios' },
  { path: 'usuarios/new', component: UsuarioForm, canActivate: [authGuard, adminGuard], title: 'Novo Usuario' },
  { path: 'usuarios/edit/:id', component: UsuarioForm, canActivate: [authGuard, adminGuard], title: 'Editar Usuario' },
  { path: 'perfil', component: UserProfile, canActivate: [authGuard], title: 'Meu Perfil' },

  { path: 'marcas', component: MarcaList, canActivate: [authGuard], title: 'Marcas' },
  { path: 'marcas/new', component: MarcaForm, canActivate: [authGuard], title: 'Nova Marca' },
  { path: 'marcas/edit/:id', component: MarcaForm, canActivate: [authGuard], title: 'Editar Marca' },
  { path: 'materiais', component: MaterialList, canActivate: [authGuard], title: 'Materiais' },
  { path: 'materiais/new', component: MaterialForm, canActivate: [authGuard], title: 'Novo Material' },
  { path: 'materiais/edit/:id', component: MaterialForm, canActivate: [authGuard], title: 'Editar Material' },
  { path: 'modelos', component: ModeloList, canActivate: [authGuard], title: 'Modelos' },
  { path: 'modelos/new', component: ModeloForm, canActivate: [authGuard], title: 'Novo Modelo' },
  { path: 'modelos/edit/:id', component: ModeloForm, canActivate: [authGuard], title: 'Editar Modelo' },
  { path: 'estoques', component: EstoqueList, canActivate: [authGuard], title: 'Estoques' },
  { path: 'estampas', component: EstampaList, canActivate: [authGuard], title: 'Estampas' },
  { path: 'estampas/new', component: EstampaForm, canActivate: [authGuard], title: 'Nova Estampa' },
  { path: 'estampas/edit/:id', component: EstampaForm, canActivate: [authGuard], title: 'Editar Estampa' }
];
