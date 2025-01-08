// 获取全部的物流记录
import request from '@/utils/request'

export const getWpsAllData = async (p) => {
    return await request({
        url: `wps/all`,
        method: 'get',
        params: {  // 使用 params 传递分页参数
            page: p.page,
            pageSize: p.pageSize,
            targetValue: p.warehousingNumber
        }
    });
};

// 导出账单
export const exportCheck = async (data) => {
    return await request({
        url: 'wps/check',
        method: 'post',
        data: {
            customerCode: data.customerCode,
            warehousingNumber: data.warehousingNumber,
            skuTotalCount: data.skuTotalCount,
            originalWeightAfterWrapping: data.originalWeightAfterWrapping,
            customerUnitPrice: data.customerUnitPrice,
            customerFreight: data.customerFreight,
            customerShelvingFee: data.customerShelvingFee,
            customerMiscellaneousFees: data.customerMiscellaneousFees,
            insuranceFee: data.insuranceFee,
            goodCostGet: data.goodCostGet,
            remarks: data.remarks,
            customerInitialBillingTotal: data.customerInitialBillingTotal,
            principal: data.principal
        }
    });
};

// 导出报价单
export const exportQuotation = async (data) => {
    return await request({
        url: 'wps/quotation',
        method: 'post',
        data: {
            customerCode: data.customerCode,
            trackingNumber: data.trackingNumber,
            itemName: data.itemName,
            destination: data.destination,
            productCategory: data.productCategory,
            quantity: data.quantity,
            weight: data.weight,
            volume: data.volume,
            density: data.density,
            value: data.value,
            insuranceFee: data.insuranceFee,
            pickupFee: data.pickupFee,
            shelvingUnitPrice: data.shelvingUnitPrice,
            shelvingFee: data.shelvingFee,
            dynamicRows: data.dynamicRows,
            totalFixedCost: data.totalFixedCost
        }
    });
};
