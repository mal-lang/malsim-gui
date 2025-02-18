import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
  InstanceModelComponent,
  Model,
  Asset,
  AssetAssociationList,
  SimpleAsset,
} from './instance-model.component';
import { ApiService } from 'src/app/services/api-service/api-service.service';
import { of } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';

describe('InstanceModelComponent', () => {
  let component: InstanceModelComponent;
  let fixture: ComponentFixture<InstanceModelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InstanceModelComponent],
      imports: [HttpClientModule],
    }).compileComponents();

    fixture = TestBed.createComponent(InstanceModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create a valid model object', () => {
    const restService = TestBed.inject(ApiService);
    const mockedModel: any = {
      metadata: {
        'MAL-Toolbox Version': '0.3.3',
        info: 'Created by the mal-toolbox model python module.',
        langID: 'org.mal-lang.coreLang',
        langVersion: '1.0.0',
        malVersion: '0.1.0-SNAPSHOT',
        name: 'Test Model',
      },
      assets: {
        '0': {
          associated_assets: {
            appConnections: {
              '26': 'CR boosrv-134.23.4.0/24',
            },
            executionPrivIAMs: {
              '63': 'Admin Exec User - boosrv',
            },
            vulnerabilities: {
              '88': 'SW Vuln - boosrv',
            },
          },
          name: 'boosrv',
          type: 'Application',
        },
        '1': {
          associated_assets: {
            appConnections: {
              '27': 'CR ca-134.23.4.0/24',
            },
            executionPrivIAMs: {
              '64': 'Admin Exec User - ca',
            },
            vulnerabilities: {
              '89': 'SW Vuln - ca',
            },
          },
          name: 'ca',
          type: 'Application',
        },
        '2': {
          associated_assets: {
            appConnections: {
              '28': 'CR db-134.23.4.0/24',
            },
            executionPrivIAMs: {
              '65': 'Admin Exec User - db',
            },
            vulnerabilities: {
              '90': 'SW Vuln - db',
            },
          },
          name: 'db',
          type: 'Application',
        },
        '25': {
          associated_assets: {
            netConnections: {
              '26': 'CR boosrv-134.23.4.0/24',
              '27': 'CR ca-134.23.4.0/24',
              '28': 'CR db-134.23.4.0/24',
            },
          },
          name: '134.23.4.0/24',
          type: 'Network',
        },
        '26': {
          associated_assets: {
            applications: {
              '0': 'boosrv',
            },
            networks: {
              '25': '134.23.4.0/24',
            },
          },
          name: 'CR boosrv-134.23.4.0/24',
          type: 'ConnectionRule',
        },
        '27': {
          associated_assets: {
            applications: {
              '1': 'ca',
            },
            networks: {
              '25': '134.23.4.0/24',
            },
          },
          name: 'CR ca-134.23.4.0/24',
          type: 'ConnectionRule',
        },
        '28': {
          associated_assets: {
            applications: {
              '2': 'db',
            },
            networks: {
              '25': '134.23.4.0/24',
            },
          },
          name: 'CR db-134.23.4.0/24',
          type: 'ConnectionRule',
        },
        '63': {
          associated_assets: {
            execPrivApps: {
              '0': 'boosrv',
            },
          },
          name: 'Admin Exec User - boosrv',
          type: 'Identity',
        },
        '64': {
          associated_assets: {
            execPrivApps: {
              '1': 'ca',
            },
          },
          name: 'Admin Exec User - ca',
          type: 'Identity',
        },
        '65': {
          associated_assets: {
            execPrivApps: {
              '2': 'db',
            },
          },
          name: 'Admin Exec User - db',
          type: 'Identity',
        },
        '88': {
          associated_assets: {
            application: {
              '0': 'boosrv',
            },
          },
          name: 'SW Vuln - boosrv',
          type: 'SoftwareVulnerability',
        },
        '89': {
          associated_assets: {
            application: {
              '1': 'ca',
            },
          },
          name: 'SW Vuln - ca',
          type: 'SoftwareVulnerability',
        },
        '90': {
          associated_assets: {
            application: {
              '2': 'db',
            },
          },
          name: 'SW Vuln - db',
          type: 'SoftwareVulnerability',
        },
      },
      attackers: {},
    };

    spyOn(restService, 'getModel').and.returnValue(of(mockedModel));

    // when
    component.getModel();

    const model: Model = {
      assets: [
        {
          id: 0,
          name: 'boosrv',
          type: 'Application',
          associatedAssets: [
            {
              type: 'appConnections',
              assets: [
                {
                  id: 26,
                  name: 'CR boosrv-134.23.4.0/24',
                },
              ],
            },
            {
              type: 'executionPrivIAMs',
              assets: [
                {
                  id: 63,
                  name: 'Admin Exec User - boosrv',
                },
              ],
            },
            {
              type: 'vulnerabilities',
              assets: [
                {
                  id: 88,
                  name: 'SW Vuln - boosrv',
                },
              ],
            },
          ],
        },
        {
          id: 1,
          name: 'ca',
          type: 'Application',
          associatedAssets: [
            {
              type: 'appConnections',
              assets: [
                {
                  id: 27,
                  name: 'CR ca-134.23.4.0/24',
                },
              ],
            },
            {
              type: 'executionPrivIAMs',
              assets: [
                {
                  id: 64,
                  name: 'Admin Exec User - ca',
                },
              ],
            },
            {
              type: 'vulnerabilities',
              assets: [
                {
                  id: 89,
                  name: 'SW Vuln - ca',
                },
              ],
            },
          ],
        },
        {
          id: 2,
          name: 'db',
          type: 'Application',
          associatedAssets: [
            {
              type: 'appConnections',
              assets: [
                {
                  id: 28,
                  name: 'CR db-134.23.4.0/24',
                },
              ],
            },
            {
              type: 'executionPrivIAMs',
              assets: [
                {
                  id: 65,
                  name: 'Admin Exec User - db',
                },
              ],
            },
            {
              type: 'vulnerabilities',
              assets: [
                {
                  id: 90,
                  name: 'SW Vuln - db',
                },
              ],
            },
          ],
        },
        {
          id: 25,
          name: '134.23.4.0/24',
          type: 'Network',
          associatedAssets: [
            {
              type: 'netConnections',
              assets: [
                {
                  id: 26,
                  name: 'CR boosrv-134.23.4.0/24',
                },
                {
                  id: 27,
                  name: 'CR ca-134.23.4.0/24',
                },
                {
                  id: 28,
                  name: 'CR db-134.23.4.0/24',
                },
              ],
            },
          ],
        },
        {
          id: 26,
          name: 'CR boosrv-134.23.4.0/24',
          type: 'ConnectionRule',
          associatedAssets: [
            {
              type: 'applications',
              assets: [
                {
                  id: 0,
                  name: 'boosrv',
                },
              ],
            },
            {
              type: 'networks',
              assets: [
                {
                  id: 25,
                  name: '134.23.4.0/24',
                },
              ],
            },
          ],
        },
        {
          id: 27,
          name: 'CR ca-134.23.4.0/24',
          type: 'ConnectionRule',
          associatedAssets: [
            {
              type: 'applications',
              assets: [
                {
                  id: 1,
                  name: 'ca',
                },
              ],
            },
            {
              type: 'networks',
              assets: [
                {
                  id: 25,
                  name: '134.23.4.0/24',
                },
              ],
            },
          ],
        },
        {
          id: 28,
          name: 'CR db-134.23.4.0/24',
          type: 'ConnectionRule',
          associatedAssets: [
            {
              type: 'applications',
              assets: [
                {
                  id: 2,
                  name: 'db',
                },
              ],
            },
            {
              type: 'networks',
              assets: [
                {
                  id: 25,
                  name: '134.23.4.0/24',
                },
              ],
            },
          ],
        },
        {
          id: 63,
          name: 'Admin Exec User - boosrv',
          type: 'Identity',
          associatedAssets: [
            {
              type: 'execPrivApps',
              assets: [
                {
                  id: 0,
                  name: 'boosrv',
                },
              ],
            },
          ],
        },
        {
          id: 64,
          name: 'Admin Exec User - ca',
          type: 'Identity',
          associatedAssets: [
            {
              type: 'execPrivApps',
              assets: [
                {
                  id: 1,
                  name: 'ca',
                },
              ],
            },
          ],
        },
        {
          id: 65,
          name: 'Admin Exec User - db',
          type: 'Identity',
          associatedAssets: [
            {
              type: 'execPrivApps',
              assets: [
                {
                  id: 2,
                  name: 'db',
                },
              ],
            },
          ],
        },
        {
          id: 88,
          name: 'SW Vuln - boosrv',
          type: 'SoftwareVulnerability',
          associatedAssets: [
            {
              type: 'application',
              assets: [
                {
                  id: 0,
                  name: 'boosrv',
                },
              ],
            },
          ],
        },
        {
          id: 89,
          name: 'SW Vuln - ca',
          type: 'SoftwareVulnerability',
          associatedAssets: [
            {
              type: 'application',
              assets: [
                {
                  id: 1,
                  name: 'ca',
                },
              ],
            },
          ],
        },
        {
          id: 90,
          name: 'SW Vuln - db',
          type: 'SoftwareVulnerability',
          associatedAssets: [
            {
              type: 'application',
              assets: [
                {
                  id: 2,
                  name: 'db',
                },
              ],
            },
          ],
        },
      ],
    };

    // then
    expect(component.model).toEqual(model);
  });
});
