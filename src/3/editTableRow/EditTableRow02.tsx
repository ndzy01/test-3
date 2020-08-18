import React from 'react';
import { Table, Input, Form, Button, Icon, Popconfirm } from 'antd';
import data_ from './data';

// const data: any[] = [];
// for (let i = 0; i < 10; i++) {
//   data.push({
//     key: i.toString(),
//     key1: `Edrward ${i}`,
//     key2: `London Park no. ${i}`,
//     key3: 32
//   });
// }

const handleGetData = (data: any[]) => {
  let arr: any[] = [];

  if (data[0].children && data[0].children.length > 0) {
    [...data[0].children].map((item) => {
      item.children = item.children.map((item_: any) => {
        item_.key = item_.id;
        item_.key1 = item.paramName;
        item_.key2 = item_.paramName;
        item_.key3 = item_.mark;
        item_.count = item.mark;
        item_.uniqueKey = item.id;
        item_.key1Span = {
          rowSpan: 0,
          colSpan: 0
        };
        item_.isDelete = 0;
        item_.isAdd = 0;
        arr.push(item_);
        return item_;
      });
      if (item.children.length > 0) {
        item.children[0].key1Span = {
          rowSpan: item.children && item.children.length,
          colSpan: 1
        };
        item.children[item.children.length - 1].isDelete = 1;
        item.children[item.children.length - 1].isAdd = 1;
      }
      return item;
    });
  }
  return arr;
};

const handleDeleteTree = (data: any[], key: any) => {
  if (data[0].children && data[0].children.length > 0) {
    data[0].children = [...data[0].children].map((item) => {
      item.children = item.children.filter(
        (item_: any) => String(item_.id) !== String(key)
      );
      return item;
    });
  }
  return data;
};

const handleColumns = (that: any) => {
  const columns = [
    {
      title: '项目名称',
      dataIndex: 'key1',
      width: '25%',
      editable: true,
      inputType: 'text',
      render: (value: any, row: { [propsName: string]: any }, index: any) => {
        const obj = {
          children: value,
          props: {
            rowSpan: row.key1Span && row.key1Span.rowSpan,
            colSpan: row.key1Span && row.key1Span.colSpan
          }
        };
        return obj;
      }
    },
    {
      title: '评分项',
      dataIndex: 'key2',
      width: '40%',
      editable: true,
      inputType: 'input'
    },
    {
      title: '总分',
      dataIndex: 'key3',
      width: '15%',
      editable: true,
      inputType: 'input'
    }
  ];
  return columns;
};

const { Provider, Consumer } = React.createContext(null);

class EditableCell extends React.Component<any, any> {
  getInput = (form: any) => {
    if (this.props.inputType === 'input') {
      return (
        <Input
          suffix={
            <span>
              {this.props.record.isDelete !== 1 ? (
                <span>
                  <Popconfirm
                    title="确定要删除吗？"
                    onConfirm={() => {
                      const tree = handleDeleteTree(
                        this.props.treeData,
                        this.props.record.key
                      );
                      // TODO:更新数据
                      console.log(tree);
                    }}
                  >
                    <Icon type="delete" />
                  </Popconfirm>
                </span>
              ) : null}
              {this.props.record.isAdd === 1 ? (
                <span>
                  <Icon type="plus" />
                </span>
              ) : null}
            </span>
          }
          onBlur={(e) => {
            const key = this.props.record.key;
            const { tableData, treeData } = this.props;
            const obj = {
              key1: form.getFieldValue(`key1_${key}`),
              key2: form.getFieldValue(`key2_${key}`),
              key3: form.getFieldValue(`key3_${key}`)
            };

            const obj1 = {
              paramName: form.getFieldValue(`key2_${key}`),
              mark: form.getFieldValue(`key3_${key}`)
            };
            form.validateFields((error: any, row: any) => {
              if (error) {
                return;
              }

              treeData[0].children = [...treeData[0].children].map((item) => {
                item.children = item.children.map((item_: any) => {
                  if (String(item_.id) === String(key)) {
                    item_ = { ...item_, ...obj1 };
                    return item_;
                  }
                  return item_;
                });
                return item;
              });
              console.log(treeData);

              const newDate = [...tableData].map((item: any) => {
                if (item.key === key) {
                  item = { ...item, ...obj };
                }
                return item;
              });
              // console.log(newDate);
              this.props.setDate(newDate);
              this.props.setDate(treeData);
            });
          }}
        />
      );
    }
    return <span>{this.props.record.key1}</span>;
  };

  handleValidate = (
    dataIndex: any,
    record: any,
    tableData: any,
    rule: any,
    value: any,
    callback: any
  ) => {
    const reg = /^[1-9]+[0-9]*$/;
    // console.log(tableData);
    if (dataIndex === 'key3') {
      const flag = reg.test(value);
      if (flag) {
        // console.log(record);
        const allCount = record.count; // 每一大项的总分
        const newData = [...tableData];
        let count = 0;
        newData
          .map((item) => {
            if (item.id === record.id) {
              item.mark = value;
            }
            return item;
          })
          .filter((item) => item.uniqueKey === record.uniqueKey)
          .map((item) => {
            count += parseInt(item.mark, 10);
            return item;
          });

        if (String(count) === String(allCount)) {
          callback();
        } else {
          callback(record.key1 + '！');
        }
      } else {
        callback('只能输入正整数');
      }
    }
    callback();
  };

  renderCell = (form: any) => {
    const { getFieldDecorator } = form;

    const {
      tableData,
      dataIndex,
      title,
      inputType,
      record,
      index,
      children,
      ...restProps
    } = this.props;
    return (
      <td {...restProps}>
        <Form.Item style={{ margin: 0 }}>
          {/* TODO: */}
          {getFieldDecorator(`${dataIndex}_${record.key}`, {
            rules: [
              {
                required: true,
                message: `请输入 ${title}!`
              },
              {
                validator: this.handleValidate.bind(
                  this,
                  dataIndex,
                  record,
                  tableData
                )
              }
            ],
            initialValue: record[dataIndex]
          })(this.getInput(form))}
        </Form.Item>
      </td>
    );
  };

  render() {
    return <Consumer>{this.renderCell}</Consumer>;
  }
}

class EditableTable extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      data: handleGetData(data_),
      treeData: data_
    };
  }
  setDate = (data: any) => {
    this.setState({
      data
    });
  };
  seeTreeData = (treeData: any) => {
    this.setState({
      treeData
    });
  };

  render() {
    const components = {
      body: {
        cell: EditableCell
      }
    };
    const columns = handleColumns(this).map((col: any) => {
      return {
        ...col,
        onCell: (record: any) => ({
          tableData: this.state.data,
          treeData: this.state.treeData,
          record,
          inputType: col.inputType || 'text',
          dataIndex: col.dataIndex,
          title: col.title,
          setDate: this.setDate.bind(this),
          seeTreeData: this.seeTreeData.bind(this)
        })
      };
    });

    return (
      <Provider value={this.props.form}>
        <Table
          components={components}
          bordered
          // dataSource={this.state.data}
          dataSource={handleGetData(this.state.treeData)}
          columns={columns}
          pagination={false}
        />
        <Button
          onClick={() => {
            console.log(this.state.data);
          }}
        >
          提交
        </Button>
      </Provider>
    );
  }
}

const EditableFormTable = Form.create()(EditableTable);

export default EditableFormTable;
