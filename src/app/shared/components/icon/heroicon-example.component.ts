import { Component } from '@angular/core';
import { LayoutComponent } from '@shared/components/layout/layout.component';
import { ContentComponent } from '@shared/components/layout/content.component';
import { ZardHeroiconComponent } from './heroicon.component';

/**
 * Example component showing how to use Heroicons
 * 
 * This demonstrates the usage of the ZardHeroiconComponent
 */
@Component({
  selector: 'app-heroicon-example',
  standalone: true,
  imports: [LayoutComponent, ContentComponent, ZardHeroiconComponent],
  template: `
    <z-layout>
      <z-content>
        <div class="p-8 space-y-6">
          <h2 class="text-2xl font-bold mb-4">Heroicons Examples</h2>
          
          <div class="space-y-4">
            <div>
              <h3 class="text-lg font-semibold mb-2">Outline Icons (24px)</h3>
              <div class="flex gap-4 items-center">
                <z-heroicon zName="home" />
                <z-heroicon zName="user" />
                <z-heroicon zName="bell" />
                <z-heroicon zName="envelope" />
                <z-heroicon zName="cog-6-tooth" />
              </div>
            </div>

            <div>
              <h3 class="text-lg font-semibold mb-2">Solid Icons (24px)</h3>
              <div class="flex gap-4 items-center">
                <z-heroicon zName="home" zStyle="solid" />
                <z-heroicon zName="user" zStyle="solid" />
                <z-heroicon zName="heart" zStyle="solid" />
                <z-heroicon zName="star" zStyle="solid" />
              </div>
            </div>

            <div>
              <h3 class="text-lg font-semibold mb-2">Different Sizes</h3>
              <div class="flex gap-4 items-center">
                <z-heroicon zName="home" [zSize]="size16" />
                <z-heroicon zName="home" [zSize]="size20" />
                <z-heroicon zName="home" [zSize]="size24" />
              </div>
            </div>

            <div>
              <h3 class="text-lg font-semibold mb-2">With Custom Classes</h3>
              <div class="flex gap-4 items-center">
                <z-heroicon zName="heart" class="text-red-500" />
                <z-heroicon zName="star" class="text-yellow-500" />
                <z-heroicon zName="bell" class="text-blue-500" />
              </div>
            </div>
          </div>
        </div>
      </z-content>
    </z-layout>
  `,
})
export class HeroiconExampleComponent {
  readonly size16: 16 = 16;
  readonly size20: 20 = 20;
  readonly size24: 24 = 24;
}

