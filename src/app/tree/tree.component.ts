import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { DataModel } from '../../shared/data.model';
import { TreeModule } from 'primeng/tree';
import { TreeDragDropService, TreeNode } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { DatePipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';


@Component({
  selector: 'app-tree',
  imports: [TreeModule, CardModule, DatePipe, ButtonModule],
  templateUrl: './tree.component.html',
  styleUrl: './tree.component.scss',
  providers: [TreeDragDropService]
})
export class TreeComponent {
  data: DataModel[] = []
  changedData: TreeNode<DataModel>[] = []
  selectedItem!: TreeNode<DataModel>
  selectedData: DataModel | null = null
  selectedEntries: [string, string | number][] = []
  childrenItem: string = ''
  isDisabled = false

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.http.get<DataModel[]>('assets/data.json').subscribe(res => {
      this.data = res
      const minItem = res.reduce((min, current) =>
        current.PARENT_ID < min.PARENT_ID ? current : min
      );

      this.changedData = [this.formatStructure(minItem)]
    })
  }

  formatStructure(item: DataModel): TreeNode<DataModel> {
    const newFormatData: TreeNode<DataModel> = {
      data: item,
      label: item.NAME,
      children: []
    }
    if (item.SYSTEM_ID) {
      const children = this.data.filter(el => +el.PARENT_ID === item.SYSTEM_ID).map(child => this.formatStructure(child))
      return {
        data: item,
        label: item.NAME,
        icon: children.length > 0 ? 'pi pi-spin pi-cog' : '',
        children: children.length > 0 ? children : undefined,
        leaf: children.length === 0
      };
    }
    return newFormatData
  }
  showSelectedItem() {
    console.log(this.selectedItem);

    const item = this.selectedItem;

    if (!item?.data) {
      this.selectedData = null;
      this.selectedEntries = [];
      this.childrenItem = '';
      return;
    }

    this.selectedData = item.data;
    this.selectedEntries = Object.entries(item.data);

    this.childrenItem = item.children?.length
      ? item.children.map(child => child.data?.NAME).filter(Boolean).join(', ')
      : '';
  }

  expandAll() {
    this.changedData.forEach((node) => {
      this.expandRecursive(node, true);
    });
    this.isDisabled = !this.isDisabled
  }

  collapseAll() {
    this.changedData.forEach((node) => {
      this.expandRecursive(node, false);
    });
    this.isDisabled = !this.isDisabled
  }

  private expandRecursive(node: TreeNode, isExpand: boolean) {
    node.expanded = isExpand;
    if (node.children) {
      node.children.forEach((childNode) => {
        this.expandRecursive(childNode, isExpand);
      });
    }
  }
}
