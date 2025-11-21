import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NewCompanyComponent } from './new-company/new-company.component';
import { CompanyListComponent } from './company-list/company-list.component';
import { CompanyMasterComponent } from './company-master/company-master.component';

const routes: Routes = [
  {
    path: "",
    children: [
      {
        path: "company-master",
        component: CompanyMasterComponent,
        data: {
          title: "Company Dashboard",
        },
      },

      {
        path: "new-company",
        component: NewCompanyComponent,
        data: {
          title: "Add New Company",
        },
      },
      {
        path: "company-list",
        component: CompanyListComponent,
        data: {
          title: "Company List",
        },
      },
      {
        path: "",
        redirectTo: "company-master",
        pathMatch: "full",
      },
      {
        path: "**",
        redirectTo: "company-master",
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CompanyRoutingModule { }
